"""One UDP endpoint with explicitly registered, independently bounded capabilities."""
import hashlib
import json
import logging
import math
import socket
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass

from .protocol import MAX_DATAGRAM, RequestError, error_response, normalize_request
from .settings import load_settings
from .request_lifetime import HEARTBEAT_SECONDS, LEASE_SECONDS, RequestLifetime

logger = logging.getLogger(__name__)


@dataclass
class _Flight:
    fingerprint: bytes
    request: dict
    lifetime: object = None
    next_progress: float = 0


class _Capability:
    def __init__(self, handler, max_workers, timeout, close, long_types):
        self.handler = handler
        self.timeout = timeout
        self.close = close
        self.long_types = long_types
        self.active = 0
        self.pool = ThreadPoolExecutor(max_workers=max_workers, thread_name_prefix="ai")
        self.slots = threading.BoundedSemaphore(max_workers)


class UDPServer:
    def __init__(self, host=None, port=None, settings=None):
        self.settings = settings or load_settings()
        self.host = self.settings.host if host is None else host
        self.port = self.settings.port if port is None else port
        self.server_socket = None
        self.running = False
        self._routes = {}
        self._capabilities = []
        self._inflight = {}
        self._settled = {}
        self._inflight_lock = threading.Lock()
        self._stop_lock = threading.RLock()
        self._closed = False

    def register(self, request_types, handler, *, max_workers, timeout, close=None, long_types=()):
        if self.running or self._closed:
            raise RuntimeError("Register capabilities before starting the service")
        if isinstance(request_types, str):
            request_types = (request_types,)
        request_types = tuple(request_types)
        if not request_types or any(not isinstance(name, str) or not name.strip() or len(name) > 64
                                    or name in ("error", "request_control", "request_progress") for name in request_types):
            raise ValueError("Invalid capability request types")
        if len(set(request_types)) != len(request_types) or any(name in self._routes for name in request_types):
            raise ValueError("Duplicate capability request type")
        if type(max_workers) is not int or max_workers <= 0:
            raise ValueError("max_workers must be positive")
        if isinstance(timeout, bool) or not isinstance(timeout, (int, float)) or not math.isfinite(timeout) or timeout <= 0:
            raise ValueError("timeout must be positive and finite")
        if not callable(handler) or (close is not None and not callable(close)):
            raise ValueError("Capability callbacks must be callable")
        if not set(long_types) <= set(request_types):
            raise ValueError("Long request types must be registered explicitly")
        capability = _Capability(handler, max_workers, timeout, close, frozenset(long_types))
        self._capabilities.append(capability)
        for name in request_types:
            self._routes[name] = capability

    def _prepare(self, request):
        request = normalize_request(request)
        capability = self._routes.get(request["type"])
        if capability is None:
            raise RequestError("invalid_request", "未知请求类型。")
        if "request_mode" in request or "request_token" in request:
            token = request.get("request_token")
            if (request.get("request_mode") != "long" or request["type"] not in capability.long_types
                    or not isinstance(token, str) or not 16 <= len(token) <= 128):
                raise RequestError("invalid_request", "不支持此请求方式。")
        return request, capability

    def start(self, stop_file=None):
        if self.running or self._closed:
            raise RuntimeError("Service already started or closed")
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            # Two services must not race the same game port.
            self.server_socket.bind((self.host, self.port))
            self.server_socket.settimeout(0.5)
            self.port = self.server_socket.getsockname()[1]
            self.running = True
            logger.info("AI service listening on %s:%s", self.host, self.port)
            while self.running and not (stop_file and stop_file.exists()):
                self._maintain()
                try:
                    data, address = self.server_socket.recvfrom(65535)
                except socket.timeout:
                    continue
                except OSError:
                    if self.running:
                        raise
                    break
                started = time.monotonic()
                request = {}
                if len(data) > MAX_DATAGRAM:
                    self._send(error_response(request, "too_large", "请求内容过长。"), address)
                    continue
                try:
                    request = json.loads(data.decode("utf-8"))
                    if isinstance(request, dict) and request.get("type") == "request_control":
                        self._control(normalize_request(request), address)
                        continue
                    request, capability = self._prepare(request)
                except RequestError as error:
                    self._send(error_response(request, error.code, str(error)), address)
                    continue
                except (UnicodeError, ValueError, RecursionError):
                    self._send(error_response(request, "invalid_request", "请求格式错误。"), address)
                    continue
                flight_key = (address, request["request_id"])
                fingerprint = hashlib.sha256(json.dumps(
                    request, ensure_ascii=False, sort_keys=True, allow_nan=False).encode("utf-8")).digest()
                with self._inflight_lock:
                    previous = self._inflight.get(flight_key)
                    settled = self._settled.get(flight_key)
                    if settled is not None:
                        if settled[0] != fingerprint:
                            self._send(error_response(request, "invalid_request", "请求ID已用于另一条消息。"), address)
                        else:
                            self._send(settled[1], address)
                        continue
                    if previous is not None:
                        if previous.fingerprint != fingerprint:
                            self._send(error_response(request, "invalid_request", "请求ID已用于另一条消息。"), address)
                        elif previous.lifetime is not None and previous.lifetime.renew():
                            self._progress(previous, address)
                        continue
                    if not capability.slots.acquire(blocking=False):
                        self._send(error_response(request, "busy", "AI正在忙碌，请稍后再试。"), address)
                        continue
                    lifetime = RequestLifetime() if request.get("request_mode") == "long" else None
                    flight = _Flight(fingerprint, request, lifetime)
                    self._inflight[flight_key] = flight
                    if lifetime is not None:
                        self._progress(flight, address)
                try:
                    capability.pool.submit(self._handle, request, address, started, flight_key, capability, lifetime)
                except RuntimeError:
                    self._release(flight_key, capability)
                    self._send(error_response(request, "unavailable", "AI服务正在停止。"), address)
        finally:
            self.stop()

    def process_request(self, request, started=None, *, lifetime=None):
        """Synchronous dispatch for workers and isolated tests; never called in the receive loop."""
        try:
            request, capability = self._prepare(request)
            is_long = request.get("request_mode") == "long"
            if is_long and lifetime is None:
                raise RequestError("invalid_request", "长请求需要存活关联。")
            deadline = None if is_long else (time.monotonic() if started is None else started) + capability.timeout
            if self._closed or (deadline is not None and time.monotonic() >= deadline) or (is_long and not lifetime.alive()):
                raise TimeoutError()
            with self._inflight_lock:
                capability.active += 1
            try:
                # Transport negotiation is not business input or a new NPC cache identity.
                payload = {key: value for key, value in request.items() if key not in ("request_mode", "request_token")}
                response = capability.handler(payload, deadline, **({"lifetime": lifetime} if is_long else {}))
            finally:
                with self._inflight_lock:
                    capability.active -= 1
            if not isinstance(response, dict):
                raise TypeError("Capability response must be an object")
            response = dict(response)
            response.setdefault("type", request["type"])
            if response["type"] not in (request["type"], "error"):
                raise TypeError("Mismatched capability response type")
            response["request_id"] = request["request_id"]
            return response
        except RequestError as error:
            return error_response(request, error.code, str(error))
        except TimeoutError:
            return error_response(request, "timeout", "AI请求超时，请稍后再试。")
        except Exception as error:
            logger.warning("AI dispatch failed: error=%s", type(error).__name__)
            return error_response(request, "internal_error", "AI服务暂时异常，请稍后再试。")

    def capability_active(self, request_type):
        with self._inflight_lock:
            capability = self._routes.get(request_type)
            return bool(capability and capability.active)

    def _progress(self, flight, address):
        self._send({"type": "request_progress", "request_id": flight.request["request_id"],
                    "request_token": flight.request["request_token"],
                    "heartbeat_seconds": HEARTBEAT_SECONDS, "lease_seconds": LEASE_SECONDS}, address)
        flight.next_progress = time.monotonic() + HEARTBEAT_SECONDS

    def _maintain(self):
        now = time.monotonic()
        with self._inflight_lock:
            for (address, _), flight in self._inflight.items():
                if flight.lifetime is not None and flight.lifetime.alive() and now >= flight.next_progress:
                    self._progress(flight, address)
            self._settled = {key: value for key, value in self._settled.items() if value[2] > now}

    def _control(self, request, address):
        if (set(request) != {"type", "request_id", "request_token", "action"}
                or request.get("action") not in ("renew", "cancel")
                or not isinstance(request.get("request_token"), str)):
            raise RequestError("invalid_request", "存活关联无效。")
        key = (address, request["request_id"])
        with self._inflight_lock:
            flight = self._inflight.get(key)
            if flight is not None and flight.lifetime is not None:
                if request["request_token"] != flight.request["request_token"]:
                    return
                if request["action"] == "cancel":
                    flight.lifetime.cancel()
                elif flight.lifetime.renew():
                    self._progress(flight, address)
                return
            cached = self._settled.get(key)
            if cached is not None and request["request_token"] == cached[1].get("request_token"):
                if request["action"] == "renew":
                    self._send(cached[1], address)
                return
        self._send({**error_response(request, "request_gone", "此番问话已中断，请重新提问。"),
                    "request_token": request["request_token"]}, address)

    @staticmethod
    def _packet(response):
        try:
            data = json.dumps(response, ensure_ascii=False, allow_nan=False).encode("utf-8")
            if len(data) > MAX_DATAGRAM:
                raise OverflowError()
        except (TypeError, ValueError, UnicodeError, RecursionError, OverflowError):
            data = json.dumps(error_response(response, "too_large", "AI回复无效或过长，请缩小问题范围。"),
                              ensure_ascii=False).encode("utf-8")
        return data

    def _send(self, response, address):
        data = self._packet(response)
        try:
            self.server_socket.sendto(data, address)
        except (OSError, AttributeError):
            logger.warning("Could not send UDP response")

    def _release(self, flight_key, capability):
        with self._inflight_lock:
            self._inflight.pop(flight_key, None)
        capability.slots.release()

    def _handle(self, request, address, started, flight_key, capability, lifetime=None):
        try:
            response = self.process_request(request, started, **({"lifetime": lifetime} if lifetime is not None else {}))
            if lifetime is not None:
                if not lifetime.alive():
                    response = error_response(request, "cancelled", "此番问话已中断，请重新提问。")
                response["request_token"] = request["request_token"]
                # Replay memory has the same bound as the actual wire response.
                response = json.loads(self._packet(response))
                with self._inflight_lock:
                    # Transition atomically before sending. A renewal racing
                    # worker cleanup must replay the final result, not progress.
                    flight = self._inflight.pop(flight_key)
                    self._settled[flight_key] = (flight.fingerprint, response, time.monotonic() + 2 * LEASE_SECONDS)
                    while len(self._settled) > self.settings.request_cache_size:
                        self._settled.pop(next(iter(self._settled)))
            self._send(response, address)
        finally:
            self._release(flight_key, capability)

    def stop(self):
        # The listener's finally and an external stop may run concurrently.
        with self._stop_lock:
            self.running = False
            if self._closed:
                return
            self._closed = True
            with self._inflight_lock:
                for flight in self._inflight.values():
                    if flight.lifetime is not None:
                        flight.lifetime.cancel()
            for capability in self._capabilities:
                capability.pool.shutdown(wait=True)
            if self.server_socket is not None:
                self.server_socket.close()
                self.server_socket = None
            for capability in self._capabilities:
                if capability.close is not None:
                    try:
                        capability.close()
                    except Exception as error:
                        logger.warning("AI capability cleanup failed: error=%s", type(error).__name__)
