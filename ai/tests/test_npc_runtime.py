"""NPC/summary integration: fake SDK, temporary documents, real transactions."""
import json
import sqlite3
import time
from contextlib import closing
from dataclasses import replace
from types import SimpleNamespace
from unittest.mock import Mock, patch

from ai.src.database import connect
from ai.src.npc.manager import NPCManager
from ai.src.npc.service import NPCService
from ai.src.runtime.context import Budget, Limits
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.tests.test_npc_ai import Fixture


def reply(status="completed", *, answer="侠客说：少侠有礼。", kind="conversation", claims=None, pending=None):
    return json.dumps(dict(status=status, kind=kind, answer=answer, claims=claims or [], pending=pending or []),
                      ensure_ascii=False)


def completion(text=None, *, tool=None, arguments=None):
    calls = [] if tool is None else [SimpleNamespace(id="lookup", type="function", function=SimpleNamespace(
        name=tool, arguments=json.dumps(arguments or {"query": "武当拜师", "threshold": 0})))]
    return SimpleNamespace(choices=[SimpleNamespace(finish_reason="tool_calls" if calls else "stop",
                                                   message=SimpleNamespace(content=text, tool_calls=calls))],
                           usage=SimpleNamespace(prompt_tokens=10, completion_tokens=5, total_tokens=15))


class NPCRuntimeTests(Fixture):
    def setup_runtime(self, *interventions):
        self.events, self.contexts = [], []
        self.knowledge_system, self.embedding = self.knowledge()
        self.addCleanup(self.knowledge_system.close)
        self.client = Mock()
        self.client.with_options.return_value = self.client
        self.client.chat.completions.create.return_value = completion(reply())
        def observe(event):
            with connect(self.service.history.db_path) as db:
                self.events.append((dict(event), db.execute("SELECT count(*) FROM conversations").fetchone()[0]))
        hooks = Hooks([*interventions, Hook("run_end", observe)])
        self.manager = NPCManager(settings=self.settings, client=self.client, knowledge=self.knowledge_system, hooks=hooks)
        self.service = NPCService(self.settings, npc_manager=self.manager)
        self.addCleanup(self.service.close)
        original = self.manager.create_context
        def capture(*args):
            context = original(*args)
            self.contexts.append(context)
            return context
        self.manager.create_context = capture

    def ask(self, **kwargs):
        return self.service.process_request(self.request(**kwargs), time.monotonic() + 80)

    def counts(self):
        with connect(self.service.history.db_path) as db:
            return [db.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
                    for table in ("conversations", "player_memories", "request_results")]

    def seed_history(self):
        for i in range(10):
            self.service.history.save_conversation("npc", "侠客", "player", "少侠",
                                                   "user" if i % 2 == 0 else "assistant", f"旧对话{i}")

    def answer_from_tool(self, **kwargs):
        messages = kwargs["messages"]
        if any("已加载专业指导" in (m.get("content") or "") and "conversation-summary" in m["content"]
               for m in messages):
            return completion("玩家与侠客谈论往事，尚未拜师。")
        if messages[-1]["role"] != "tool":
            return completion(tool="knowledge__search")
        evidence = json.loads(messages[-1]["content"])["value"]["evidence"]
        self.assertTrue(evidence)
        return completion(reply(kind="rules", answer="侠客说：武当拜师须先寻张三丰。", claims=[
            dict(text="武当拜师须先寻张三丰", evidence=[evidence[0]["id"]])]))

    def test_completed_transaction_precedes_terminal_and_replays_without_model(self):
        self.setup_runtime()
        first = self.ask(message="你好")
        self.assertEqual(first["type"], "chat")
        self.assertEqual(self.counts(), [2, 1, 1])
        self.assertEqual([(e["status"], count) for e, count in self.events], [("completed", 2)])
        self.assertEqual(self.ask(message="你好"), first)
        self.assertEqual(len(self.contexts), 1)
        self.assertEqual(self.client.chat.completions.create.call_count, 1)
        # A fresh service can read the same legacy-format success cache.
        restarted = NPCService(self.settings, npc_manager=self.manager)
        self.addCleanup(restarted.close)
        self.assertEqual(restarted.process_request(self.request(message="你好"), time.monotonic() + 80), first)
        self.assertEqual(self.client.chat.completions.create.call_count, 1)

    def test_backup_copy_retains_baseline_sql_contract_and_replay(self):
        self.setup_runtime()
        response = self.ask(message="你好")
        self.service.history.save_summary("npc", "player", 2, "玩家与侠客互致问候。")
        copied = self.root / "rollback-copy"
        copied.mkdir()
        self.service.close()  # No competing writers during the backup/rollback fixture.
        with connect(self.service.history.db_path) as source, \
             closing(sqlite3.connect(copied / "conversations.db")) as target:
            source.backup(target)
        # Fixed reader contract from 2f8192a5; not an execution of the old release.
        with connect(copied / "conversations.db") as db:
            rows = db.execute("SELECT role,CASE WHEN role='user' THEN COALESCE(message,content) "
                              "ELSE content END AS content FROM conversations "
                              "WHERE npc_id=? AND player_id=? ORDER BY id", ("npc", "player")).fetchall()
            self.assertEqual([row["role"] for row in rows], ["user", "assistant"])
            self.assertEqual(rows[1]["content"], response["response"])
            memory = json.loads(db.execute("SELECT data FROM player_memories WHERE npc_id=? AND player_id=?",
                                           ("npc", "player")).fetchone()[0])
            self.assertEqual(memory["total_interactions"], 1)
            self.assertEqual(db.execute("SELECT through_id FROM summaries").fetchone()[0], 2)
            cached = db.execute("SELECT fingerprint,response FROM request_results WHERE request_id=? AND created>?",
                                (self.request()["request_id"], time.time() - self.settings.request_cache_ttl)).fetchone()
            self.assertEqual(json.loads(cached["response"]), response)
        rollback = NPCService(replace(self.settings, data_dir=copied), npc_manager=self.manager)
        self.addCleanup(rollback.close)
        self.assertEqual(rollback.process_request(self.request(message="你好"), time.monotonic() + 80), response)
        self.assertEqual(self.client.chat.completions.create.call_count, 1)
        self.assertTrue(self.service.history.db_path.exists())

    def test_needs_input_and_incomplete_do_not_persist_or_increase_relationship(self):
        self.setup_runtime()
        for status in ("needs_input", "incomplete"):
            self.client.chat.completions.create.return_value = completion(reply(
                status, answer="侠客说：少侠所问的是哪一门绝学？", pending=["绝学名称未定"]))
            result = self.ask(request_id=status)
            self.assertEqual(result["type"], "chat")
            self.assertEqual(self.counts(), [0, 0, 0])
            self.assertEqual(self.events[-1][0]["status"], status)
        self.assertEqual(self.client.chat.completions.create.call_count, 2)

    def test_missing_evidence_replans_instead_of_committing_unsupported_claim(self):
        self.setup_runtime()
        self.client.chat.completions.create.side_effect = [
            completion(reply(kind="rules", answer="侠客说：拜师须贡献一万。")),
            completion(reply("incomplete", answer="侠客说：此事还须查证。", pending=["缺少依据"]))]
        self.assertEqual(self.ask()["response"], "侠客说：此事还须查证。")
        self.assertEqual(self.counts(), [0, 0, 0])
        messages = self.client.chat.completions.create.call_args.kwargs["messages"]
        self.assertIn("missing_rule_evidence", messages[-1]["content"])

    def test_actual_knowledge_tool_and_shared_summary_model_embedding_rerank_budget(self):
        self.setup_runtime()
        self.seed_history()
        self.knowledge_system.update_vectors()
        self.settings.dashscope_api_key = "fake-offline-test"
        self.client.chat.completions.create.side_effect = self.answer_from_tool
        ranked = Mock()
        ranked.json.return_value = {"output": {"results": [{"index": 0, "relevance_score": .99}]}}
        with patch("ai.src.knowledge_qwen.httpx.post", return_value=ranked):
            result = self.ask()
        self.assertEqual(result["type"], "chat")
        snapshot = self.contexts[0].budget.snapshot()
        self.assertEqual(snapshot["model_calls"], 3)  # summary + request tool + verified answer
        self.assertEqual(snapshot["external_calls"], 5)  # plus embedding and rerank
        self.assertEqual(snapshot["tool_calls"], 3)  # two Skill preloads + retrieval
        self.assertEqual(snapshot["usage"]["total_tokens"], 45)
        self.assertEqual({e["root_id"] for e, _ in self.events}, {self.contexts[0].root_id})
        self.assertGreater(self.service.history.get_summary("npc", "player")["through_id"], 0)
        self.assertEqual(self.counts(), [12, 1, 1])

    def test_failed_summary_keeps_watermark_but_shares_consumed_budget(self):
        self.setup_runtime()
        self.seed_history()
        truncated = completion("未完成摘要")
        truncated.choices[0].finish_reason = "length"
        self.client.chat.completions.create.side_effect = [truncated, completion(reply())]
        self.assertEqual(self.ask()["type"], "chat")
        self.assertEqual(self.service.history.get_summary("npc", "player")["through_id"], 0)
        self.assertEqual(self.contexts[0].budget.snapshot()["model_calls"], 2)
        self.assertEqual(self.contexts[0].budget.snapshot()["usage"]["total_tokens"], 30)
        self.assertEqual([e["status"] for e, _ in self.events], ["failed", "completed"])

    def test_commit_denial_preserves_all_chat_tables(self):
        self.setup_runtime(Hook("before_commit", lambda e: Decision("deny"), intervention=True))
        self.assertEqual(self.ask()["type"], "error")
        self.assertEqual(self.counts(), [0, 0, 0])
        self.assertEqual([e["status"] for e, _ in self.events], ["failed"])

    def test_transaction_failure_rolls_back_history_and_has_only_failed_terminal(self):
        self.setup_runtime()
        with connect(self.service.history.db_path) as db:
            db.execute("CREATE TRIGGER fail_memory BEFORE INSERT ON player_memories BEGIN "
                       "SELECT RAISE(ABORT, 'PRIVATE_STORAGE_ERROR'); END")
        result = self.ask()
        self.assertEqual(result["type"], "error")
        self.assertNotIn("PRIVATE", json.dumps(result))
        self.assertEqual(self.counts(), [0, 0, 0])
        self.assertEqual([(e["status"], count) for e, count in self.events], [("failed", 0)])

    def test_cancelled_or_expired_candidate_never_commits(self):
        for cancel in (False, True):
            with self.subTest(cancel=cancel):
                self.setup_runtime()
                clock = [time.monotonic()]
                def late(**kwargs):
                    if cancel:
                        self.contexts[-1].budget.cancelled.set()
                    else:
                        clock[0] += 100
                    return completion(reply())
                self.client.chat.completions.create.side_effect = late
                with patch("ai.src.runtime.context.time.monotonic", side_effect=lambda: clock[0]):
                    self.ask(request_id=str(cancel))
                self.assertEqual(self.counts(), [0, 0, 0])
                self.assertNotIn("completed", [e["status"] for e, _ in self.events])

    def test_summary_cannot_obtain_a_separate_root_budget(self):
        self.setup_runtime()
        self.seed_history()
        original = self.manager.create_context
        def limited(*args):
            context = replace(original(*args), budget=Budget(Limits(model_calls=1)))
            self.contexts[-1] = context
            return context
        self.manager.create_context = limited
        self.client.chat.completions.create.return_value = completion("玩家与侠客谈论往事。")
        self.assertEqual(self.ask()["type"], "chat")
        self.assertEqual(self.client.chat.completions.create.call_count, 1)
        self.assertEqual(self.counts(), [10, 0, 0])
        self.assertEqual(self.events[-1][0]["status"], "incomplete")

    def test_repeated_malformed_output_stops_without_progress_or_persistence(self):
        self.setup_runtime()
        self.client.chat.completions.create.return_value = completion("not JSON")
        response = self.ask()
        self.assertEqual(response["type"], "chat")
        self.assertEqual(self.client.chat.completions.create.call_count, 4)
        self.assertEqual(self.contexts[0].budget.snapshot()["model_calls"], 4)
        self.assertEqual(self.contexts[0].budget.snapshot()["external_calls"], 4)
        self.assertEqual(self.counts(), [0, 0, 0])
        self.assertEqual([(event["status"], event["code"], count) for event, count in self.events],
                         [("incomplete", "no_progress", 0)])
        self.assertIn("连续 1 轮",
                      self.client.chat.completions.create.call_args_list[2].kwargs["messages"][-1]["content"])

    def test_forged_privileges_never_enable_source_main_or_private_scope(self):
        self.setup_runtime()
        request = {**self.request(), "audience": "admin", "scope": "all", "agent": "main_router",
                   "policy": {"tools": ["source.read"]}}
        self.assertEqual(self.service.process_request(request, time.monotonic() + 80)["type"], "chat")
        context = self.contexts[0]
        self.assertEqual(context.audience, "player")
        self.assertEqual(context.policy.scopes, {"knowledge"})
        self.assertEqual(context.policy.tools, {"skill", "knowledge.search"})
        names = {entry["function"]["name"] for entry in self.client.chat.completions.create.call_args.kwargs["tools"]}
        self.assertEqual(names, {"skill", "knowledge__search"})

    def test_another_player_receives_no_private_history_or_memory(self):
        self.setup_runtime()
        self.ask(message="PRIVATE_FIRST_PLAYER_NOTE")
        self.ask(player="second", request_id="second", message="你好")
        messages = self.client.chat.completions.create.call_args.kwargs["messages"]
        self.assertNotIn("PRIVATE_FIRST_PLAYER_NOTE", json.dumps(messages))
        self.assertNotEqual(self.contexts[0].session, self.contexts[1].session)

    def test_missing_required_skill_does_not_use_old_inline_prompt(self):
        self.settings.skills_dir = self.root / "empty-skills"
        self.settings.skills_dir.mkdir()
        self.setup_runtime()
        self.assertEqual(self.ask()["type"], "error")
        self.client.chat.completions.create.assert_not_called()
        self.assertEqual(self.counts(), [0, 0, 0])

    def test_model_cannot_lower_role_retrieval_threshold(self):
        self.setup_runtime()
        self.manager.npc_configs["npc"]["knowledge_threshold"] = 1
        self.client.chat.completions.create.side_effect = [completion(tool="knowledge__search"), completion(
            reply("incomplete", answer="侠客说：此事尚待查证。", pending=["资料不足"]))]
        self.assertEqual(self.ask()["type"], "chat")
        messages = self.client.chat.completions.create.call_args.kwargs["messages"]
        self.assertEqual(json.loads(messages[-1]["content"])["value"]["evidence"], [])
        self.assertEqual(self.counts(), [0, 0, 0])
