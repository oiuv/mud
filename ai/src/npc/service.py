"""NPC request validation, session serialization and atomic chat persistence."""
import hashlib
import json
import logging
import threading
import time

from ..database import connect
from ..protocol import error_response
from ..runtime.contracts import RuntimeFault
from .history import HistoryManager
from .memory import MemoryStore
from .manager import NPCManager, ChatUnavailable

logger = logging.getLogger(__name__)


class NPCService:
    request_types = ("chat", "memory", "config")
    _error = staticmethod(error_response)

    def __init__(self, settings, npc_manager=None, history=None, memory=None):
        self.settings = settings
        self.history = history if history is not None else HistoryManager(settings.data_dir)
        self.memory = memory if memory is not None else MemoryStore(settings.data_dir)
        self._owns_npc = npc_manager is None
        self._sessions = [threading.Lock() for _ in range(64)]
        with connect(self.history.db_path) as db:
            db.execute("""CREATE TABLE IF NOT EXISTS request_results(
                request_id TEXT PRIMARY KEY,fingerprint TEXT NOT NULL,
                response TEXT NOT NULL,created REAL NOT NULL)""")
        self.npc = npc_manager if npc_manager is not None else NPCManager(settings=settings)

    def process_request(self, request, deadline):
        deadline = min(deadline, time.monotonic() + self.settings.request_timeout)
        for key in ("npc_id", "player_id"):
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
        session = (request["npc_id"], request.get("player_id", ""))
        lock = self._sessions[hash(session) % len(self._sessions)]
        if not lock.acquire(timeout=max(0, deadline - time.monotonic())):
            return self._error(request, "timeout", "此人尚未回过神来，少侠请稍候再问。")
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
            return self._error(request, "timeout", "此人尚未回过神来，少侠请稍候再问。")
        except RuntimeFault:
            return self._error(request, "model_unavailable", "此事眼下难以答复，少侠不妨稍后再问。")
        except ValueError as error:
            logger.warning("NPC request rejected: request_id=%s error=%s", request["request_id"], type(error).__name__)
            return self._error(request, "invalid_request", "此事眼下难以答复，少侠不妨稍后再问。")
        except Exception as error:
            logger.warning("NPC request failed: request_id=%s error=%s",
                           request["request_id"], type(error).__name__)
            return self._error(request, "internal_error", "此人此刻无心交谈，少侠不妨稍后再问。")
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
            raise ValueError("此人眼下无心交谈。")
        capacity = config.get("memory_capacity", 100)
        player_name = request.get("player_name", player_id)
        runtime = isinstance(self.npc, NPCManager)
        context = self.npc.create_context(request["request_id"], npc_id, player_id, deadline) if runtime else None
        history = []
        if capacity:
            summary, batch = self.history.summary_batch(
                npc_id, player_id, capacity, self.settings.history_max_chars)
            if batch:
                try:
                    # Separate call: never replace the player's current question.
                    conversation = [
                        {"role": row["role"], "content": row["content"]} for row in batch
                    ]
                    if runtime:
                        outcome = self.npc.prepare_summary(summary["content"], conversation, context)
                        if outcome is not None:
                            self.npc.runner.commit(outcome, lambda text: self.history.save_summary(
                                npc_id, player_id, batch[-1]["id"], text, check=outcome.context.check))
                    else:
                        text = self.npc.summarize(summary["content"], conversation, deadline)
                        if text:
                            self.history.save_summary(npc_id, player_id, batch[-1]["id"], text)
                except (ChatUnavailable, RuntimeFault):
                    logger.warning("Summary failed; retaining original history")
            history = self.history.get_context(npc_id, player_id, capacity, self.settings.history_max_chars)
        memory = self.memory.get_player_memory(npc_id, player_id)
        reply = self.npc.generate_response(
            npc_id, player_name, request["message"], memory, history, request.get("context", ""), deadline,
            **({"run_context": context, "defer_commit": True} if runtime else {}))
        response = dict(type="chat", request_id=request["request_id"], npc_id=npc_id,
                        player_id=player_id, response=reply.text, simulated=reply.simulated)
        if reply.status != "completed":
            # Clarifications/incomplete results are deliverable, not successful turns.
            # Keep the old wire shape; no history/relationship/success cache writes.
            if time.monotonic() >= deadline:
                raise TimeoutError()
            return response
        # A single transaction commits history, relationship and deduplication result.
        def commit(value):
            if runtime:
                context.check()
                if (context.actor != player_id or context.session != json.dumps([npc_id, player_id])
                        or context.request_id != request["request_id"]):
                    raise RuntimeFault("session_changed")
            updated = None
            if not reply.simulated:
                updated = self.npc.update_player_memory(npc_id, player_id, player_name,
                                                       request["message"], reply.text, memory)
            with connect(self.history.db_path) as db:
                db.execute("BEGIN IMMEDIATE")
                if time.monotonic() >= deadline:
                    raise TimeoutError()
                if runtime:
                    context.check()
                # An ID reused by another session must not overwrite its committed result.
                existing = db.execute("SELECT fingerprint,response FROM request_results WHERE request_id=? AND created>?",
                                      (request["request_id"], time.time() - self.settings.request_cache_ttl)).fetchone()
                if existing:
                    if existing["fingerprint"] != fingerprint:
                        raise ValueError("请求尚未结束，请稍候再问。")
                    return json.loads(existing["response"])
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
        if runtime and reply.outcome is not None:
            return self.npc.runner.commit(reply.outcome, commit)
        return commit(None)

    def close(self):
        if self._owns_npc:
            self.npc.close()
