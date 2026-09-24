"""One UDP endpoint with explicitly registered, independently bounded capabilities."""
import hashlib
import json
import logging
import math
import socket
import threading
import time
from concurrent.futures import ThreadPoolExecutor

from .protocol import MAX_DATAGRAM, RequestError, error_response, normalize_request
from .settings import load_settings

logger = logging.getLogger(__name__)


class _Capability:
    def __init__(self, handler, max_workers, timeout, close):
        self.handler = handler
        self.timeout = timeout
        self.close = close
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
        self._inflight_lock = threading.Lock()
        self._stop_lock = threading.RLock()
        self._closed = False

    def register(self, request_types, handler, *, max_workers, timeout, close=None):
        if self.running or self._closed:
            raise RuntimeError("Register capabilities before starting the service")
        if isinstance(request_types, str):
            request_types = (request_types,)
        request_types = tuple(request_types)
        if not request_types or any(not isinstance(name, str) or not name.strip() or len(name) > 64
                                    or name == "error" for name in request_types):
            raise ValueError("Invalid capability request types")
        if len(set(request_types)) != len(request_types) or any(name in self._routes for name in request_types):
            raise ValueError("Duplicate capability request type")
        if type(max_workers) is not int or max_workers <= 0:
            raise ValueError("max_workers must be positive")
        if isinstance(timeout, bool) or not isinstance(timeout, (int, float)) or not math.isfinite(timeout) or timeout <= 0:
            raise ValueError("timeout must be positive and finite")
        if not callable(handler) or (close is not None and not callable(close)):
            raise ValueError("Capability callbacks must be callable")
        capability = _Capability(handler, max_workers, timeout, close)
        self._capabilities.append(capability)
        for name in request_types:
            self._routes[name] = capability

    def _prepare(self, request):
        request = normalize_request(request)
        capability = self._routes.get(request["type"])
        if capability is None:
            raise RequestError("invalid_request", "未知请求类型。")
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
                    if previous is not None:
                        if previous != fingerprint:
                            self._send(error_response(request, "invalid_request", "请求ID已用于另一条消息。"), address)
                        continue
                    if not capability.slots.acquire(blocking=False):
                        self._send(error_response(request, "busy", "AI正在忙碌，请稍后再试。"), address)
                        continue
                    self._inflight[flight_key] = fingerprint
                try:
                    capability.pool.submit(self._handle, request, address, started, flight_key, capability)
                except RuntimeError:
                    self._release(flight_key, capability)
                    self._send(error_response(request, "unavailable", "AI服务正在停止。"), address)
        finally:
            self.stop()

    def process_request(self, request, started=None):
        """Synchronous dispatch for workers and isolated tests; never called in the receive loop."""
        try:
            request, capability = self._prepare(request)
            deadline = (time.monotonic() if started is None else started) + capability.timeout
            if self._closed or time.monotonic() >= deadline:
                raise TimeoutError()
            response = capability.handler(request, deadline)
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

    def _send(self, response, address):
        try:
            data = json.dumps(response, ensure_ascii=False, allow_nan=False).encode("utf-8")
            if len(data) > MAX_DATAGRAM:
                raise OverflowError()
        except (TypeError, ValueError, UnicodeError, RecursionError, OverflowError):
            data = json.dumps(error_response(response, "too_large", "AI回复无效或过长，请缩小问题范围。"),
                              ensure_ascii=False).encode("utf-8")
        try:
            self.server_socket.sendto(data, address)
        except (OSError, AttributeError):
            logger.warning("Could not send UDP response")

    def _release(self, flight_key, capability):
        with self._inflight_lock:
            self._inflight.pop(flight_key, None)
        capability.slots.release()

    def _handle(self, request, address, started, flight_key, capability):
        try:
            self._send(self.process_request(request, started), address)
        finally:
            self._release(flight_key, capability)

    def stop(self):
        # The listener's finally and an external stop may run concurrently.
        with self._stop_lock:
            self.running = False
            if self._closed:
                return
            for capability in self._capabilities:
                capability.pool.shutdown(wait=True)
            if self.server_socket is not None:
                self.server_socket.close()
                self.server_socket = None
            self._closed = True
            for capability in self._capabilities:
                if capability.close is not None:
                    try:
                        capability.close()
                    except Exception as error:
                        logger.warning("AI capability cleanup failed: error=%s", type(error).__name__)
