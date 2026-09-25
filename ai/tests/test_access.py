"""Trusted entry ceilings and cache isolation; temporary data, fake providers."""
import json
import os
import time
import unittest
from dataclasses import replace
from unittest.mock import Mock, patch

from ai.src.database import connect
from ai.src.diagnostics import diagnose_text, RetrievalDiagnostic
from ai.src.npc.agents import POLICY
from ai.src.npc.manager import NPCManager
from ai.src.npc.service import NPCService
from ai.src.runtime.access import bind_context
from ai.src.runtime.context import Budget, Limits, Policy, RunContext
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.tools import Tools
from ai.src.settings import Settings, load_settings
from ai.src.tools.knowledge import knowledge_tool
from ai.src.udp_server import UDPServer
from ai.tests.test_npc_ai import Fixture
from ai.tests.test_npc_runtime import completion, reply


class PolicyTests(unittest.TestCase):
    def test_deployment_cannot_grant_unregistered_source_or_main(self):
        result = POLICY.restrict({"tools": ["source.read", "knowledge.search"],
                                  "agents": ["main_router", "npc_dialogue"],
                                  "scopes": ["source", "knowledge"]})
        self.assertEqual(result.tools, {"knowledge.search"})
        self.assertEqual(result.agents, {"npc_dialogue"})
        self.assertEqual(result.scopes, {"knowledge"})
        self.assertEqual(POLICY.restrict({}), POLICY)
        self.assertFalse(POLICY.restrict({"tools": []}).tools)

    def test_patterns_are_intersected_not_union_or_exact_string_intersection(self):
        policy = POLICY.restrict({"knowledge_paths": ["schools/*", "guide"]})
        policy = policy.restrict({"knowledge_paths": ["*/sword", "other"]})
        self.assertTrue(policy.permits_knowledge("schools/sword"))
        for path in ("guide", "schools/fist", "other", "elsewhere/sword"):
            self.assertFalse(policy.permits_knowledge(path))
        self.assertFalse(policy.restrict({"knowledge_paths": []}).permits_knowledge("schools/sword"))

    def test_invalid_deployment_config_fails_at_startup(self):
        for value in ([], {"admin": True}, {"tools": "skill"}, {"version": ""},
                      {"knowledge_paths": "*"}, {"knowledge_paths": ["../secret"]},
                      {"knowledge_paths": ["C:/secret"]}, {"knowledge_paths": ["/secret"]}):
            with self.subTest(value=value), self.assertRaises(ValueError):
                Settings(runtime_policy=value)

    def test_binding_preserves_root_budget_deadline_identity_and_child_intersection(self):
        parent = RunContext("r", "alice", "player", "s", POLICY.restrict({"tools": ["skill"]}),
                            time.monotonic() + 10, Budget(Limits()))
        parent.state.evidence["private"] = {"id": "private"}
        entry = bind_context(POLICY, "r", "alice", "player", "s", time.monotonic() + 80,
                             Limits(), parent=parent)
        child = entry.enter("npc_dialogue", POLICY, Limits(), delegated=True)
        self.assertEqual(child.policy.tools, {"skill"})
        self.assertEqual(child.root_id, parent.root_id)
        self.assertEqual(child.deadline, parent.deadline)
        self.assertEqual(child.state.evidence, {})
        child.budget.reserve(child.deadline, model_calls=1)
        self.assertEqual(parent.budget.snapshot()["model_calls"], 1)
        self.assertEqual(parent.budget.snapshot()["delegations"], 1)
        parent.budget.cancelled.set()
        with self.assertRaises(RuntimeFault):
            child.check()

    def test_binding_rejects_actor_audience_session_and_request_rebinding(self):
        parent = RunContext("r", "alice", "player", "s", POLICY, time.monotonic() + 10)
        for field, value in (("request_id", "other"), ("actor", "bob"),
                             ("audience", "admin"), ("session", "other")):
            args = dict(request_id="r", actor="alice", audience="player", session="s")
            args[field] = value
            with self.subTest(field=field), self.assertRaises(RuntimeFault) as raised:
                bind_context(POLICY, **args, deadline=parent.deadline, limits=Limits(), parent=parent)
            self.assertEqual(raised.exception.code, "session_denied")

    def test_fingerprint_covers_all_permissions_and_versions(self):
        baseline = POLICY.fingerprint()
        changes = {key: [] for key in ("tools", "skills", "scopes", "egress_scopes", "agents")}
        changes.update(version="changed", knowledge_paths=["guide"])
        for key, value in changes.items():
            self.assertNotEqual(POLICY.restrict({key: value}).fingerprint(), baseline)
        self.assertEqual(POLICY.restrict({"knowledge_paths": ["a", "b"]}).fingerprint(),
                         POLICY.restrict({"knowledge_paths": ["b", "a", "a"]}).fingerprint())


class EntryAccessTests(Fixture):
    def setup_service(self):
        self.knowledge_system, self.embedding = self.knowledge()
        self.addCleanup(self.knowledge_system.close)
        self.client = Mock()
        self.client.with_options.return_value = self.client
        self.client.chat.completions.create.return_value = completion(reply())
        self.manager = NPCManager(settings=self.settings, client=self.client, knowledge=self.knowledge_system)
        self.service = NPCService(self.settings, npc_manager=self.manager)
        self.addCleanup(self.service.close)

    def ask(self, request=None, **kwargs):
        return self.service.process_request(request or self.request(), time.monotonic() + 80, **kwargs)

    def test_environment_configuration_is_not_a_request_field(self):
        with patch.dict(os.environ, {"RUNTIME_POLICY": '{"tools":["skill"]}'}):
            settings = load_settings(self.root / "missing.env")
        self.assertEqual(settings.runtime_policy, {"tools": ["skill"]})
        self.settings.runtime_policy = settings.runtime_policy
        self.setup_service()
        forged = {**self.request(), "runtime_policy": {}, "policy": {"tools": ["source.read"]},
                  "audience": "admin", "scope": "all", "agent": "main_router"}
        self.assertEqual(self.ask(forged)["type"], "chat")
        names = {tool["function"]["name"] for tool in self.client.chat.completions.create.call_args.kwargs["tools"]}
        self.assertEqual(names, {"skill"})

    def test_role_document_scope_filters_before_rerank_and_egress(self):
        self.settings.runtime_policy = {"knowledge_paths": ["w*"]}
        self.setup_service()
        self.manager.npc_configs["npc"]["knowledge_paths"] = ["*dang", "shaolin"]
        self.knowledge_system.update_vectors()
        self.settings.dashscope_api_key = "fake-offline"
        ranked = Mock()
        ranked.json.return_value = {"output": {"results": [{"index": 0, "relevance_score": .99}]}}
        context = self.manager.create_context("r", "npc", "alice")
        context = context.enter("npc_dialogue", POLICY, Limits())
        with patch("ai.src.knowledge_qwen.httpx.post", return_value=ranked) as post:
            result = Tools([knowledge_tool(self.knowledge_system)]).execute(
                "knowledge.search", {"query": "武当少林", "threshold": 0}, context, "lookup")
        self.assertEqual([item["path"] for item in result["value"]["evidence"]], ["wudang"])
        self.assertNotIn("少林弟子", str(post.call_args.kwargs["json"]))

    def test_empty_role_scope_denies_documents_but_prose_knowledge_stays_data(self):
        self.setup_service()
        role = self.manager.npc_configs["npc"]
        role["knowledge_base"] = ["武当秘闻"]
        self.assertTrue(self.manager.entry_policy("npc").permits_knowledge("wudang"))
        role["knowledge_paths"] = []
        self.client.chat.completions.create.side_effect = [completion(tool="knowledge__search"), completion(
            reply("incomplete", answer="侠客说：此事尚待查证。", pending=["缺少资料"]))]
        self.assertEqual(self.ask()["type"], "chat")
        messages = self.client.chat.completions.create.call_args.kwargs["messages"]
        self.assertEqual(json.loads(messages[-1]["content"])["value"]["evidence"], [])

    def test_invalid_role_path_rejected_at_load(self):
        self.roles.write_text(json.dumps({"npc": {"knowledge_paths": ["../secret"]}}), encoding="utf-8")
        with self.assertRaises(ValueError):
            NPCManager(settings=self.settings)

    def test_scope_change_rejects_success_cache_and_does_not_recall_model(self):
        self.setup_service()
        first = self.ask()
        self.assertEqual(first["type"], "chat")
        self.assertEqual(self.ask(), first)
        self.manager.npc_configs["npc"]["knowledge_paths"] = ["wudang"]
        self.assertEqual(self.ask()["type"], "error")
        self.client.chat.completions.create.assert_called_once()
        self.assertEqual(self.ask(self.request(request_id="new"))["type"], "chat")

    def test_new_cache_survives_restart_with_same_scope(self):
        self.settings.runtime_policy = {"knowledge_paths": ["wudang"]}
        self.setup_service()
        first = self.ask()
        restarted = NPCService(self.settings, npc_manager=self.manager)
        self.addCleanup(restarted.close)
        self.assertEqual(restarted.process_request(self.request(), time.monotonic() + 80), first)
        self.client.chat.completions.create.assert_called_once()

    def test_legacy_cache_only_replays_under_unchanged_public_policy(self):
        self.setup_service()
        first = self.ask()
        with connect(self.service.history.db_path) as db:
            db.execute("DELETE FROM request_authorities")  # Simulate old four-column cache.
        self.assertEqual(self.ask(), first)
        self.settings.runtime_policy = {"tools": ["skill"]}
        self.assertEqual(self.ask()["type"], "error")
        self.client.chat.completions.create.assert_called_once()

    def test_agent_disabled_even_for_cached_and_simulated_answers(self):
        self.setup_service()
        self.assertEqual(self.ask()["type"], "chat")
        self.settings.runtime_policy = {"agents": []}
        self.manager.client = None
        self.assertEqual(self.ask()["type"], "error")
        self.assertEqual(self.ask(self.request(request_id="fresh"))["type"], "error")
        self.client.chat.completions.create.assert_called_once()

    def test_parent_cannot_rebind_player_or_memory_session_before_read(self):
        self.setup_service()
        parent = self.manager.create_context("r1", "npc", "alice")
        with patch.object(self.service.memory, "get_player_memory") as read:
            for kind in ("chat", "memory"):
                result = self.ask({**self.request(player="bob"), "type": kind}, parent=parent)
                self.assertEqual(result["type"], "error")
            read.assert_not_called()
        self.client.chat.completions.create.assert_not_called()

    def test_parent_policy_bounds_business_entry_and_cache(self):
        self.setup_service()
        self.assertEqual(self.ask()["type"], "chat")
        parent = self.manager.create_context("r1", "npc", "player")
        parent = replace(parent, policy=parent.policy.restrict({"tools": ["skill"]}))
        self.assertEqual(self.ask(parent=parent)["type"], "error")
        fresh = self.request(request_id="fresh")
        parent = replace(parent, request_id="fresh")
        self.assertEqual(self.ask(fresh, parent=parent)["type"], "chat")
        names = {tool["function"]["name"] for tool in self.client.chat.completions.create.call_args.kwargs["tools"]}
        self.assertEqual(names, {"skill"})
        self.assertEqual(parent.budget.snapshot()["model_calls"], 1)

    def test_tool_replay_and_vector_cache_include_document_permissions(self):
        self.setup_service()
        self.knowledge_system.update_vectors()
        self.embedding.embeddings.create.reset_mock()
        original = self.manager.create_context("r", "npc", "alice")
        changed = replace(original, policy=original.policy.restrict({"knowledge_paths": ["wudang"]}))
        for context in (original, original, changed):
            self.knowledge_system._query_vector("武当", context.deadline, context=context)
        self.assertEqual(self.embedding.embeddings.create.call_count, 2)
        tools = Tools([knowledge_tool(self.knowledge_system)])
        self.assertTrue(tools.execute("knowledge.search", {"query": "武当"}, original, "same")["ok"])
        self.assertEqual(tools.execute("knowledge.search", {"query": "武当"}, changed, "same")["error"],
                         "call_id_conflict")

    def test_local_diagnostics_also_obey_deployment_limits(self):
        self.setup_service()
        self.settings.runtime_policy = {"agents": [], "tools": []}
        outcome = diagnose_text(self.settings, self.client, "测试")
        self.assertEqual(outcome.result.code, "agent_denied")
        self.client.chat.completions.create.assert_not_called()
        with self.assertRaises(RuntimeFault) as raised:
            RetrievalDiagnostic(self.knowledge_system, mode="bm25").search("武当")
        self.assertEqual(raised.exception.code, "tool_denied")

    def test_main_route_not_registered_and_metadata_is_bounded(self):
        self.setup_service()
        server = UDPServer(settings=self.settings)
        self.addCleanup(server.stop)
        server.register(self.service.request_types, self.service.process_request,
                        max_workers=1, timeout=10)
        self.assertEqual(server.process_request({"type": "agent_run", "goal": "x"})["type"], "error")
        self.settings.request_cache_size = 1
        self.ask()
        self.ask(self.request(request_id="r2"))
        with connect(self.service.history.db_path) as db:
            self.assertEqual(db.execute("SELECT count(*) FROM request_authorities").fetchone()[0], 1)


if __name__ == "__main__":
    unittest.main()
