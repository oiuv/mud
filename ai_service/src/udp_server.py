"""Bounded UDP workers, correlated responses and serialized NPC/player sessions."""
import hashlib
import json
import logging
import socket
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor

from .database import connect
from .history_manager import HistoryManager
from .memory_store import MemoryStore
from .npc_manager import NPCManager, ChatUnavailable
from .settings import load_settings

logger = logging.getLogger(__name__)
MAX_DATAGRAM = 8192


class UDPServer:
    def __init__(self, host=None, port=None, settings=None, npc_manager=None, history=None, memory=None):
        self.settings = settings or load_settings()
        self.host = host or self.settings.host
        self.port = self.settings.port if port is None else port
        self.history = history or HistoryManager(self.settings.data_dir)
        self.memory = memory or MemoryStore(self.settings.data_dir)
        self.npc = npc_manager or NPCManager(settings=self.settings)
        self.server_socket = None
        self.running = False
        self._pool = None
        self._inflight = set()
        self._inflight_lock = threading.Lock()
        self._slots = threading.BoundedSemaphore(self.settings.max_workers)
        self._sessions = [threading.Lock() for _ in range(64)]
        with connect(self.history.db_path) as db:
            db.execute("""CREATE TABLE IF NOT EXISTS request_results(
                request_id TEXT PRIMARY KEY,fingerprint TEXT NOT NULL,
                response TEXT NOT NULL,created REAL NOT NULL)""")

    def start(self, stop_file=None):
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Do not enable SO_REUSEADDR: two servers must not race the same game port.
        self.server_socket.bind((self.host, self.port))
        self.server_socket.settimeout(0.5)
        self.port = self.server_socket.getsockname()[1]
        self.running = True
        self._pool = ThreadPoolExecutor(max_workers=self.settings.max_workers)
        logger.info("AI NPC service listening on %s:%s", self.host, self.port)
        try:
            while self.running and not (stop_file and stop_file.exists()):
                try:
                    data, address = self.server_socket.recvfrom(65535)
                except socket.timeout:
                    continue
                except OSError:
                    if self.running:
                        raise
                    break
                if len(data) > MAX_DATAGRAM:
                    self._send(self._error({}, "too_large", "请求内容过长。"), address)
                    continue
                try:
                    request = json.loads(data.decode("utf-8"))
                except (UnicodeDecodeError, ValueError, RecursionError):
                    self._send(self._error({}, "invalid_request", "请求格式错误。"), address)
                    continue
                flight_key = None
                if isinstance(request, dict) and isinstance(request.get("request_id"), str):
                    flight_key = (address, request["request_id"])
                    with self._inflight_lock:
                        if flight_key in self._inflight:
                            continue
                if not self._slots.acquire(blocking=False):
                    self._send(self._error(request, "busy", "AI正在忙碌，请稍后再试。"), address)
                    continue
                if flight_key:
                    with self._inflight_lock:
                        self._inflight.add(flight_key)
                self._pool.submit(self._handle, request, address, time.monotonic(), flight_key)
        finally:
            self.stop()

    def _send(self, response, address):
        data = json.dumps(response, ensure_ascii=False).encode("utf-8")
        if len(data) > MAX_DATAGRAM:
            data = json.dumps(self._error(response, "too_large", "AI回复过长，请缩小问题范围。"),
                              ensure_ascii=False).encode("utf-8")
        try:
            self.server_socket.sendto(data, address)
        except (OSError, AttributeError):
            logger.warning("Could not send UDP response")

    def _handle(self, request, address, started, flight_key=None):
        try:
            self._send(self.process_request(request, started), address)
        finally:
            with self._inflight_lock:
                self._inflight.discard(flight_key)
            self._slots.release()

    @staticmethod
    def _error(request, code, message):
        response = {"type": "error", "code": code, "error": message}
        if isinstance(request, dict):
            for key in ("request_id", "npc_id", "player_id"):
                if isinstance(request.get(key), str):
                    response[key] = request[key][:128]
        return response

    def process_request(self, request, started=None):
        if not isinstance(request, dict):
            return self._error({}, "invalid_request", "请求必须是JSON对象。")
        request = dict(request)
        request.setdefault("request_id", uuid.uuid4().hex)
        request.setdefault("type", "chat")
        for key in ("request_id", "npc_id", "player_id"):
            required = key != "player_id" or request["type"] != "config"
            value = request.get(key)
            if (required or value is not None) and (not isinstance(value, str) or not value.strip() or len(value) > 128):
                return self._error(request, "invalid_request", "缺少或无效的请求标识。")
        if request["type"] == "chat":
            message = request.get("message")
            if not isinstance(message, str) or not message.strip() or len(message) > self.settings.max_message_chars:
                return self._error(request, "invalid_request", "提问不能为空且不能超过1000字。")
            if not isinstance(request.get("player_name", request["player_id"]), str):
                return self._error(request, "invalid_request", "玩家姓名格式错误。")
            if len(request.get("player_name", "")) > 128:
                return self._error(request, "invalid_request", "玩家姓名过长。")
            context = request.get("context", "")
            if not isinstance(context, (str, dict)) or len(json.dumps(context, ensure_ascii=False)) > 1600:
                return self._error(request, "invalid_request", "情境信息格式错误或过长。")
        elif request["type"] not in ("memory", "config"):
            return self._error(request, "invalid_request", "未知请求类型。")
        deadline = (started if started is not None else time.monotonic()) + self.settings.request_timeout
        session = (request["npc_id"], request.get("player_id", ""))
        lock = self._sessions[hash(session) % len(self._sessions)]
        if not lock.acquire(timeout=max(0, deadline - time.monotonic())):
            return self._error(request, "timeout", "AI请求超时，请稍后再试。")
        try:
            if time.monotonic() >= deadline:
                raise TimeoutError()
            if request["type"] == "chat":
                return self.handle_chat(request, deadline)
            if request["type"] == "memory":
                return dict(type="memory", request_id=request["request_id"], npc_id=request["npc_id"],
                            player_id=request["player_id"],
                            memory=self.memory.get_player_memory(*session),
                            recent_conversations=self.history.get_conversation_history(*session, limit=5))
            return dict(type="config", request_id=request["request_id"], npc_id=request["npc_id"],
                        config=self.npc.get_npc_config(request["npc_id"]))
        except ChatUnavailable as error:
            return self._error(request, "model_unavailable", str(error))
        except TimeoutError:
            return self._error(request, "timeout", "AI请求超时，请稍后再试。")
        except ValueError as error:
            return self._error(request, "invalid_request", str(error))
        except Exception:
            logger.exception("AI request failed: %s", request["request_id"])
            return self._error(request, "internal_error", "AI服务暂时异常，请稍后再试。")
        finally:
            lock.release()

    def handle_chat(self, request, deadline):
        npc_id, player_id = request["npc_id"], request["player_id"]
        fingerprint = hashlib.sha256(json.dumps(
            request, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()
        with connect(self.history.db_path) as db:
            cached = db.execute("SELECT * FROM request_results WHERE request_id=? AND created>?",
                                (request["request_id"], time.time() - self.settings.request_cache_ttl)).fetchone()
        if cached:
            if cached["fingerprint"] != fingerprint:
                raise ValueError("请求ID已用于另一条消息。")
            return json.loads(cached["response"])
        config = self.npc.get_npc_config(npc_id)
        if not config:
            raise ValueError("该NPC尚未配置AI角色。")
        capacity = config.get("memory_capacity", 100)
        player_name = request.get("player_name", player_id)
        history = []
        if capacity:
            summary, batch = self.history.summary_batch(
                npc_id, player_id, capacity, self.settings.history_max_chars)
            if batch:
                try:
                    # Separate call: never replace the player's current question.
                    text = self.npc.summarize(summary["content"], [
                        {"role": row["role"], "content": row["content"]} for row in batch
                    ], deadline)
                    if text:
                        self.history.save_summary(npc_id, player_id, batch[-1]["id"], text)
                except ChatUnavailable:
                    logger.warning("Summary failed; retaining original history")
            history = self.history.get_context(npc_id, player_id, capacity, self.settings.history_max_chars)
        memory = self.memory.get_player_memory(npc_id, player_id)
        reply = self.npc.generate_response(
            npc_id, player_name, request["message"], memory, history, request.get("context", ""), deadline)
        if time.monotonic() > deadline:
            raise TimeoutError()
        response = dict(type="chat", request_id=request["request_id"], npc_id=npc_id,
                        player_id=player_id, response=reply.text, simulated=reply.simulated)
        updated = None
        if not reply.simulated:
            updated = self.npc.update_player_memory(npc_id, player_id, player_name,
                                                   request["message"], reply.text, memory)
        # A single transaction commits history, relationship and deduplication result.
        with connect(self.history.db_path) as db:
            db.execute("BEGIN IMMEDIATE")
            if time.monotonic() >= deadline:
                raise TimeoutError()
            # An ID reused by another session must not overwrite its committed result.
            existing = db.execute("SELECT fingerprint FROM request_results WHERE request_id=? AND created>?",
                                  (request["request_id"], time.time() - self.settings.request_cache_ttl)).fetchone()
            if existing and existing["fingerprint"] != fingerprint:
                raise ValueError("Request ID belongs to another message")
            if not reply.simulated:
                db.executemany("""
                    INSERT INTO conversations(npc_id,npc_name,player_id,player_name,role,content,message)
                    VALUES(?,?,?,?,?,?,?)
                """, [(npc_id, config["name"], player_id, player_name, "user", request["message"], request["message"]),
                      (npc_id, config["name"], player_id, player_name, "assistant", reply.text, None)])
                db.execute("""
                    INSERT INTO player_memories VALUES(?,?,?)
                    ON CONFLICT(npc_id,player_id) DO UPDATE SET data=excluded.data
                """, (npc_id, player_id, json.dumps(updated, ensure_ascii=False)))
            db.execute("INSERT OR REPLACE INTO request_results VALUES(?,?,?,?)",
                       (request["request_id"], fingerprint, json.dumps(response, ensure_ascii=False), time.time()))
            db.execute("DELETE FROM request_results WHERE created<?",
                       (time.time() - self.settings.request_cache_ttl,))
            db.execute("""DELETE FROM request_results WHERE request_id IN
                (SELECT request_id FROM request_results ORDER BY created DESC LIMIT -1 OFFSET ?)""",
                       (self.settings.request_cache_size,))
        return response

    def stop(self):
        self.running = False
        if self._pool:
            self._pool.shutdown(wait=True)
            self._pool = None
        if self.server_socket:
            self.server_socket.close()
            self.server_socket = None
