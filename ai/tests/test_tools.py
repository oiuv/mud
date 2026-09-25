"""Shared tool access, offline retrieval and trusted package discovery."""
import importlib
import sys
import time
from dataclasses import replace
from types import SimpleNamespace
from unittest.mock import Mock, patch

from ai.src.database import connect
from ai.src.runtime.context import Budget, Limits, Policy, RunContext
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.runtime.tools import Tools
from ai.src.tools.knowledge import knowledge_tool
from ai.tests.test_npc_ai import Fixture


class SharedToolTests(Fixture):
    def context(self, **changes):
        policy = Policy(tools={"knowledge.search"}, scopes={"knowledge"},
                        egress_scopes={"knowledge"}, agents={"npc"})
        values = dict(request_id="tool-test", actor="player", audience="player", session="npc:player",
                      agent_id="npc", policy=policy, deadline=time.monotonic() + 10)
        values.update(changes)
        return RunContext(**values)

    def test_permissions_and_schema_apply_to_programmatic_calls(self):
        knowledge, client = self.knowledge()
        tools = Tools([knowledge_tool(knowledge)])
        for policy, expected in (
                (Policy(), "tool_denied"),
                (Policy(tools={"knowledge.search"}), "scope_denied"),
                (Policy(tools={"knowledge.search"}, scopes={"knowledge"}), "egress_denied")):
            context = self.context(policy=policy)
            result = tools.execute("knowledge.search", {"query": "武当"}, context, "call")
            self.assertEqual(result["error"], expected)
        context = self.context()
        self.assertFalse(tools.execute("knowledge.search", {"query": "武当", "audience": "admin"}, context, "bad")["ok"])
        client.embeddings.create.assert_not_called()

    def test_candidates_filtered_before_remote_rerank_and_bm25(self):
        knowledge, client = self.knowledge()
        knowledge.settings = replace(knowledge.settings, dashscope_api_key="fake-only", rerank_enabled=True)
        knowledge.update_vectors()
        client.embeddings.create.reset_mock()
        response = Mock()
        response.json.return_value = {"output": {"results": [{"index": 0, "relevance_score": .9}]}}
        context = self.context()
        tools = Tools([knowledge_tool(knowledge, allowed=lambda ctx, doc: doc["filename"] == "wudang")])
        with patch("ai.src.knowledge_qwen.httpx.post", return_value=response) as post:
            reply = tools.execute("knowledge.search", {"query": "武当少林", "threshold": 0}, context, "search")
        self.assertTrue(reply["ok"], reply)
        self.assertEqual(len(reply["value"]["evidence"]), 1)
        self.assertEqual(reply["value"]["evidence"][0]["path"], "wudang")
        self.assertNotIn("少林弟子", str(post.call_args.kwargs["json"]))
        self.assertEqual(context.budget.snapshot()["external_calls"], 2)
        self.assertEqual(len(context.state.evidence), 1)
        before = context.budget.snapshot()["external_calls"]
        self.assertEqual(tools.execute("knowledge.search", {"query": "武当少林", "threshold": 0}, context, "search"), reply)
        self.assertEqual(context.budget.snapshot()["external_calls"], before)
        self.assertEqual(tools.execute("knowledge.search", {"query": "other"}, context, "search")["error"], "call_id_conflict")

    def test_cache_isolated_by_audience_actor_session_and_permissions(self):
        knowledge, client = self.knowledge()
        knowledge.update_vectors()
        client.embeddings.create.reset_mock()
        context = self.context()
        for ctx in (context, context, replace(context, audience="admin"),
                    replace(context, actor="other"), replace(context, session="other"),
                    replace(context, policy=replace(context.policy, scopes={"knowledge", "extra"}))):
            knowledge._query_vector("武当", ctx.deadline, context=ctx)
        self.assertEqual(client.embeddings.create.call_count, 5)

    def test_failures_are_budgeted_and_local_fallback_retains_evidence(self):
        knowledge, client = self.knowledge()
        knowledge.update_vectors()
        client.embeddings.create.side_effect = RuntimeError("private-api-key")
        context = self.context()
        tools = Tools([knowledge_tool(knowledge)])
        reply = tools.execute("knowledge.search", {"query": "武当"}, context, "call")
        self.assertTrue(reply["ok"], reply)
        self.assertTrue(reply["value"]["evidence"])
        self.assertIn("vector_unavailable", reply["value"]["degraded"])
        self.assertEqual(context.budget.snapshot()["external_calls"], 1)
        self.assertNotIn("private-api-key", str(reply))

    def test_exhaustion_and_required_hook_do_not_fall_back_or_call_provider(self):
        knowledge, client = self.knowledge()
        knowledge.update_vectors()
        client.embeddings.create.reset_mock()
        root = Budget(Limits(external_calls=0))
        context = self.context(budget=Budget(parent=root))
        with self.assertRaises(RuntimeFault) as caught:
            Tools([knowledge_tool(knowledge)]).execute("knowledge.search", {"query": "武当"}, context, "a")
        self.assertEqual(caught.exception.code, "budget_exhausted")
        hooks = Hooks([Hook("before_model", lambda event: Decision("deny"), intervention=True)])
        context = self.context()
        result = Tools([knowledge_tool(knowledge, hooks)]).execute("knowledge.search", {"query": "武当"}, context, "b")
        self.assertEqual(result["error"], "hook_denied")
        client.embeddings.create.assert_not_called()

    def test_local_only_does_not_send_query_or_documents(self):
        knowledge, client = self.knowledge()
        context = self.context(external_model=False,
                               policy=Policy(tools={"knowledge.search"}, scopes={"knowledge"}))
        result = Tools([knowledge_tool(knowledge)]).execute("knowledge.search", {"query": "武当"}, context, "a")
        self.assertTrue(result["value"]["evidence"])
        self.assertEqual(context.budget.snapshot()["external_calls"], 0)
        client.embeddings.create.assert_not_called()

    def test_usage_counted_before_after_model_denial(self):
        knowledge, client = self.knowledge()
        client.embeddings.create.side_effect = None
        client.embeddings.create.return_value = SimpleNamespace(
            usage=SimpleNamespace(prompt_tokens=12, total_tokens=12),
            data=[SimpleNamespace(embedding=[1, 0, 0, 0])])
        context = self.context()
        hooks = Hooks([Hook("after_model", lambda event: Decision("deny"), intervention=True)])
        with self.assertRaises(RuntimeFault):
            knowledge.get_embedding("武当", context=context, hooks=hooks)
        self.assertEqual(context.budget.snapshot()["usage"]["total_tokens"], 12)
        self.assertEqual(context.budget.snapshot()["external_calls"], 1)

    def test_new_trusted_package_is_discovered_without_dispatch_branch(self):
        package = self.root / "fixture_tools"
        package.mkdir()
        (package / "__init__.py").write_text("", encoding="utf-8")
        (package / "sample.py").write_text(
            'from ai.src.runtime.tools import Tool\nfrom ai.src.runtime.contracts import Contract\n'
            'def build_tools(services):\n'
            '    yield Tool("fixture.read", "fixture", Contract({}), Contract({}), lambda ctx, args: {"value": 7})\n',
            encoding="utf-8")
        sys.path.insert(0, str(self.root))
        try:
            importlib.invalidate_caches()
            tools = Tools()
            tools.discover("fixture_tools", {})
            context = self.context()
            self.assertEqual(tools.definitions(context), [])
            self.assertEqual(tools.execute("fixture.read", {}, context, "a")["error"], "tool_denied")
            context = replace(context, policy=Policy(tools={"fixture.read"}))
            self.assertEqual(tools.execute("fixture.read", {}, context, "b")["value"], {"value": 7})
            with self.assertRaises(ValueError):
                tools.discover("fixture_tools", {})
        finally:
            sys.path.remove(str(self.root))
            for name in ("fixture_tools", "fixture_tools.sample"):
                sys.modules.pop(name, None)
