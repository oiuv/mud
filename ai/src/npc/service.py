"""NPC request validation, session serialization and atomic chat persistence."""
import hashlib
import json
import logging
import threading
import time
from dataclasses import replace

from ..database import connect
from ..capacity import Capacity
from ..protocol import error_response
from ..runtime.contracts import Contract, RuntimeFault
from ..runtime.delegation import Delegate
from ..runtime.results import Results
from ..runtime.access import check_session
from .agents import POLICY
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
        self.capacity = Capacity(settings.max_workers)
        with connect(self.history.db_path) as db:
            db.execute("""CREATE TABLE IF NOT EXISTS request_results(
                request_id TEXT PRIMARY KEY,fingerprint TEXT NOT NULL,
                response TEXT NOT NULL,created REAL NOT NULL)""")
            # Sidecar preserves the four-column legacy cache/rollback contract.
            db.execute("""CREATE TABLE IF NOT EXISTS request_authorities(
                request_id TEXT PRIMARY KEY,authority TEXT NOT NULL)""")
            db.execute("""CREATE TABLE IF NOT EXISTS request_deliveries(
                request_id TEXT PRIMARY KEY,payload TEXT NOT NULL)""")
        self.npc = npc_manager if npc_manager is not None else NPCManager(settings=settings)

    def process_request(self, request, deadline, *, parent=None, lifetime=None, handoff=False):
        try:
            with self.capacity.enter():
                return self._process_request(request, deadline, parent=parent, lifetime=lifetime, handoff=handoff)
        except RuntimeFault as error:
            if error.code != "business_busy":
                raise
            return self._error(request, "busy", "此人正忙，少侠请稍候再问。")

    def _process_request(self, request, deadline, *, parent=None, lifetime=None, handoff=False):
        if handoff and parent is None:
            raise RuntimeFault("agent_denied")
        if deadline is not None:
            deadline = min(deadline, time.monotonic() + self.settings.request_timeout)
        def check():
            if lifetime is not None and not lifetime.alive():
                raise TimeoutError()
            if deadline is not None and time.monotonic() >= deadline:
                raise TimeoutError()
            if parent is not None:
                parent.check()
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
        acquired = False
        try:
            while not acquired:
                check()
                acquired = lock.acquire(timeout=.05)
            check()
            if parent is not None:
                check_session(parent, request["request_id"], session[1], "player", json.dumps(list(session)))
                if not isinstance(self.npc, NPCManager):
                    raise RuntimeFault("agent_denied")
            policy = (self.npc.entry_policy(session[0]) if isinstance(self.npc, NPCManager)
                      else POLICY.restrict(self.settings.runtime_policy))
            if parent is not None:
                policy = policy.intersect(parent.policy)
            if "npc_dialogue" not in policy.agents:
                raise RuntimeFault("agent_denied")
            if request["type"] == "chat":
                return self.handle_chat(request, deadline, policy, parent, lifetime=lifetime, check=check,
                                        handoff=handoff)
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
            if acquired:
                lock.release()

    @staticmethod
    def _handoff(response, reply=None, *, cached=None, context=None):
        value = reply.outcome.result.value if reply is not None and reply.outcome is not None else {}
        ref = None
        if reply is not None and reply.outcome is not None and reply.status == "completed":
            ref = reply.outcome.context.results.publish(reply.outcome)
        elif cached is not None:
            record = json.loads(cached)
            value = record["value"]
            if value.get("status") != "completed" or value.get("answer") != response["response"]:
                raise RuntimeFault("invalid_cached_result")
            ref = context.results.restore(context, "npc_dialogue", cached)
        result = {"status": reply.status if reply is not None else "completed",
                  "summary": response["response"], "pending": value.get("pending", []) if isinstance(value, dict) else [],
                  "conclusions": value.get("claims", []) if isinstance(value, dict) else [],
                  "limitations": ["源码依据仅代表查验时的快照，不证明实服已加载状态。"]
                  if isinstance(value, dict) and value.get("investigation") else []}
        if ref is not None:
            result["result_ref"] = ref
            # Child evidence stays with the settled artifact. Handoff claims
            # carry the reference the parent is authorized to cite directly.
            result["conclusions"] = [
                {**claim, "evidence": [ref] if claim["evidence"] else []}
                for claim in result["conclusions"]]
        return result

    def handle_chat(self, request, deadline, policy, parent=None, *, lifetime=None, check, handoff=False):
        npc_id, player_id = request["npc_id"], request["player_id"]
        authority = hashlib.sha256(json.dumps(
            [npc_id, player_id, "player", policy.fingerprint(),
             parent.external_model if parent is not None else True], ensure_ascii=False).encode("utf-8")).hexdigest()
        def check_authority(db):
            row = db.execute("SELECT authority FROM request_authorities WHERE request_id=?",
                             (request["request_id"],)).fetchone()
            # Old caches predate permission metadata; only the unchanged public
            # direct-entry policy can replay them. Never upgrade an unknown scope.
            if ((row is not None and row["authority"] != authority)
                    or (row is None and (parent is not None or policy != POLICY))):
                raise RuntimeFault("cache_scope_conflict")
        fingerprint = hashlib.sha256(json.dumps(
            request, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()
        with connect(self.history.db_path) as db:
            cached = db.execute("SELECT * FROM request_results WHERE request_id=? AND created>?",
                                (request["request_id"], time.time() - self.settings.request_cache_ttl)).fetchone()
            if cached:
                check_authority(db)
            delivery = db.execute("SELECT payload FROM request_deliveries WHERE request_id=?",
                                  (request["request_id"],)).fetchone() if cached and handoff else None
        if cached:
            if cached["fingerprint"] != fingerprint:
                raise ValueError("请求ID已用于另一条消息。")
            check()
            if parent is not None:
                parent.check()
            response = json.loads(cached["response"])
            if not handoff:
                return response
            context = self.npc.create_context(request["request_id"], npc_id, player_id, deadline, parent)
            context = replace(context, policy=context.policy.intersect(self.npc.runner.agents["npc_dialogue"].policy))
            return self._handoff(response, cached=delivery["payload"] if delivery else None, context=context)
        config = self.npc.get_npc_config(npc_id)
        if not config:
            raise ValueError("此人眼下无心交谈。")
        capacity = config.get("memory_capacity", 100)
        player_name = request.get("player_name", player_id)
        runtime = isinstance(self.npc, NPCManager)
        context = (self.npc.create_context(request["request_id"], npc_id, player_id, deadline, parent,
                                          **({"alive": lifetime.alive} if lifetime is not None else {})) if runtime else None)
        if runtime and context.policy != policy:
            raise RuntimeFault("policy_changed")
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
                            self.history.save_summary(npc_id, player_id, batch[-1]["id"], text, check=check)
                except (ChatUnavailable, RuntimeFault):
                    logger.warning("Summary failed; retaining original history")
            check()
            history = self.history.get_context(npc_id, player_id, capacity, self.settings.history_max_chars)
        check()
        memory = self.memory.get_player_memory(npc_id, player_id)
        reply = self.npc.generate_response(
            npc_id, player_name, request["message"], memory, history, request.get("context", ""), deadline,
            **({"run_context": context, "defer_commit": True} if runtime else {}))
        response = dict(type="chat", request_id=request["request_id"], npc_id=npc_id,
                        player_id=player_id, response=reply.text, simulated=reply.simulated)
        if reply.status != "completed":
            # Clarifications/incomplete results are deliverable, not successful turns.
            # Keep the old wire shape; no history/relationship/success cache writes.
            check()
            return self._handoff(response, reply) if handoff else response
        # A single transaction commits history, relationship and deduplication result.
        def commit(value):
            check()
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
                check()
                if runtime:
                    context.check()
                # An ID reused by another session must not overwrite its committed result.
                existing = db.execute("SELECT fingerprint,response FROM request_results WHERE request_id=? AND created>?",
                                      (request["request_id"], time.time() - self.settings.request_cache_ttl)).fetchone()
                if existing:
                    if existing["fingerprint"] != fingerprint:
                        raise ValueError("请求尚未结束，请稍候再问。")
                    check_authority(db)
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
                db.execute("INSERT OR REPLACE INTO request_authorities VALUES(?,?)",
                           (request["request_id"], authority))
                if handoff and runtime and reply.outcome is not None:
                    db.execute("INSERT OR REPLACE INTO request_deliveries VALUES(?,?)", (
                        request["request_id"], Results.pack(value, reply.outcome.context.state.evidence)))
                db.execute("DELETE FROM request_results WHERE created<?",
                           (time.time() - self.settings.request_cache_ttl,))
                db.execute("""DELETE FROM request_results WHERE request_id IN
                    (SELECT request_id FROM request_results ORDER BY created DESC LIMIT -1 OFFSET ?)""",
                           (self.settings.request_cache_size,))
                db.execute("DELETE FROM request_authorities WHERE request_id NOT IN (SELECT request_id FROM request_results)")
                db.execute("DELETE FROM request_deliveries WHERE request_id NOT IN (SELECT request_id FROM request_results)")
                check()
            return response
        if runtime and reply.outcome is not None:
            committed = self.npc.runner.commit(reply.outcome, commit)
        else:
            committed = commit(None)
        return self._handoff(committed, reply) if handoff else committed

    def delegation(self, *, original_goal=None, situation=""):
        """Bind this service, not a model-selected NPC/actor or private history."""
        def session(context):
            try:
                pair = json.loads(context.session)
            except (TypeError, ValueError):
                raise RuntimeFault("session_denied") from None
            if (context.audience != "player" or not isinstance(pair, list) or len(pair) != 2
                    or pair[1] != context.actor or not isinstance(pair[0], str)
                    or context.session != json.dumps(pair) or not isinstance(self.npc, NPCManager)
                    or not self.npc.get_npc_config(pair[0])
                    or "npc_dialogue" not in self.npc.entry_policy(pair[0]).intersect(context.policy).agents):
                raise RuntimeFault("session_denied")
            return pair

        def invoke(context, payload):
            npc_id, player_id = session(context)
            request = {"type": "chat", "request_id": context.request_id,
                       "npc_id": npc_id, "player_id": player_id, "message": payload["message"]}
            if original_goal is not None:
                # Bound by the entry adapter, not rewritten in model tool input.
                # Keep the original scope without copying the parent transcript.
                request["context"] = {"original_goal": original_goal, "scene": situation}
            response = self.process_request(request, context.deadline, parent=context, handoff=True)
            context.check()
            if response.get("type") == "error":
                raise RuntimeFault("business_busy" if response.get("code") == "busy" else "business_failed")
            return response

        return Delegate("npc_dialogue", "向当前会话的角色咨询或调查规则；不能切换玩家或角色。",
                        Contract({"type": "object", "required": ["message"], "additionalProperties": False,
                                  "properties": {"message": {"type": "string", "minLength": 1,
                                                              "maxLength": self.settings.max_message_chars}}}),
                        invoke, session)

    def close(self):
        if self._owns_npc:
            self.npc.close()
