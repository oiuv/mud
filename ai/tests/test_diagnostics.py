"""Local diagnostic entries exercise the runtime, never live providers or game data."""
import ast
from contextlib import redirect_stdout, redirect_stderr
from dataclasses import replace
import io
from pathlib import Path
import time
from types import SimpleNamespace
from unittest.mock import Mock, patch

from ai.src.diagnostics import diagnose_text, RetrievalDiagnostic
from ai.src.runtime.context import Budget, Limits, Policy, RunContext
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.hooks import Hooks, Hook, Decision
from ai.src.runtime.tools import Tools
from ai.src.tools.knowledge import knowledge_tool
from ai.tests.test_npc_ai import Fixture
from ai.scripts import performance_test, benchmark_cache, test_retrieval


class DiagnosticRuntimeTests(Fixture):
    def events(self):
        events = []
        hooks = Hooks([Hook(name, lambda event: events.append(event)) for name in
                       ("run_start", "before_model", "after_model", "before_tool", "after_tool", "run_end")])
        return events, hooks

    def client(self):
        client = Mock()
        client.with_options.return_value = client
        client.chat.completions.create.return_value = SimpleNamespace(
            choices=[SimpleNamespace(finish_reason="stop", message=SimpleNamespace(content="连接正常"))],
            usage=SimpleNamespace(prompt_tokens=3, completion_tokens=2, total_tokens=5))
        return client

    def test_chat_one_model_no_tools_or_npc_and_unique_terminal(self):
        client = self.client()
        events, hooks = self.events()
        outcome = diagnose_text(self.settings, client, "测试", hooks=hooks)
        self.assertEqual(outcome.result.value, "连接正常")
        self.assertTrue(outcome.finalized)
        self.assertEqual(outcome.context.budget.snapshot()["model_calls"], 1)
        self.assertEqual(outcome.context.budget.snapshot()["external_calls"], 1)
        self.assertEqual(outcome.context.budget.snapshot()["usage"]["total_tokens"], 5)
        call = client.chat.completions.create.call_args.kwargs
        self.assertEqual(call["messages"], [{"role": "user", "content": "测试"}])
        self.assertNotIn("tools", call)
        self.assertEqual([event["event"] for event in events],
                         ["run_start", "before_model", "after_model", "run_end"])
        self.assertEqual(events[-1]["status"], "completed")

    def test_chat_required_hook_denial_no_provider_and_single_terminal(self):
        client = self.client()
        events, observe = self.events()
        hooks = Hooks((*observe.hooks, Hook("before_model", lambda e: Decision("deny"), intervention=True)))
        outcome = diagnose_text(self.settings, client, "测试", hooks=hooks)
        self.assertEqual(outcome.result.code, "hook_denied")
        client.chat.completions.create.assert_not_called()
        self.assertEqual(sum(e["event"] == "run_end" for e in events), 1)
        self.assertFalse(next(e for e in events if e["event"] == "after_model")["executed"])

    def test_local_bm25_uses_tool_filters_and_no_remote(self):
        basic = self.corpus()
        (self.help / ".env").write_text("武当 secret-token", encoding="utf-8")
        basic.process_files()
        events, hooks = self.events()
        result, ctx = RetrievalDiagnostic(basic, mode="bm25", hooks=hooks).search("武当")
        self.assertTrue(result["evidence"])
        self.assertNotIn("secret-token", str(result))
        self.assertIn("bm25_score", result["evidence"][0]["diagnostics"])
        self.assertEqual(ctx.budget.snapshot()["external_calls"], 0)
        self.assertEqual(ctx.budget.snapshot()["tool_calls"], 1)
        self.assertEqual([e["event"] for e in events],
                         ["run_start", "before_tool", "after_tool", "run_end"])

    def test_remote_calls_and_hooks_share_budget_and_cache(self):
        knowledge, client = self.knowledge()
        knowledge.update_vectors()
        client.embeddings.create.reset_mock()
        events, hooks = self.events()
        budget = Budget(Limits(model_calls=0, external_calls=1, tool_calls=3))
        diagnostic = RetrievalDiagnostic(knowledge, mode="vector", hooks=hooks, budget=budget)
        diagnostic.search("武当", threshold=0)
        diagnostic.search("武当", threshold=0)
        with self.assertRaisesRegex(RuntimeFault, "budget_exhausted"):
            diagnostic.search("少林", threshold=0)
        self.assertEqual(client.embeddings.create.call_count, 1)
        self.assertEqual(budget.snapshot()["external_calls"], 1)
        self.assertEqual(budget.snapshot()["tool_calls"], 3)
        ends = [e for e in events if e["event"] == "run_end"]
        self.assertEqual([e["status"] for e in ends], ["completed", "completed", "incomplete"])

    def test_cancelled_batch_does_not_execute(self):
        knowledge, client = self.knowledge()
        budget = Budget()
        budget.cancelled.set()
        with self.assertRaisesRegex(RuntimeFault, "cancelled"):
            RetrievalDiagnostic(knowledge, budget=budget).search("武当")
        client.embeddings.create.assert_not_called()

    def test_diagnostic_options_cannot_expand_network_tool(self):
        basic = self.corpus()
        ctx = RunContext("id", "player", "player", "session",
                         Policy(tools={"knowledge.search"}, scopes={"knowledge"}),
                         time.monotonic() + 10, external_model=False)
        reply = Tools([knowledge_tool(basic, diagnostic=True, mode="bm25")]).execute(
            "knowledge.search", {"query": "武当"}, ctx, "q")
        self.assertEqual(reply["error"], "audience_denied")
        knowledge, _ = self.knowledge()
        tools = Tools([knowledge_tool(knowledge)])
        for arguments in ({"query": "武当", "limit": 500}, {"query": "武当", "diagnostic": True}):
            reply = tools.execute("knowledge.search", arguments, ctx, str(arguments))
            self.assertFalse(reply["ok"])

    def test_large_diagnostic_results_explicitly_partial_and_bounded(self):
        basic = self.corpus()
        docs = [dict(id=str(i), filename="wudang", title="武当", content="武当" * 4000,
                     score=1, bm25_score=1) for i in range(500)]
        with patch.object(basic, "search", return_value=docs):
            result, ctx = RetrievalDiagnostic(basic, mode="bm25").search("武当", limit=500)
        self.assertTrue(result["truncated"])
        self.assertLess(len(str(result).encode("utf-8")), 65536)
        self.assertLess(len(result["evidence"]), 500)

    def test_cli_errors_redact_untrusted_value_error(self):
        output = io.StringIO()
        with redirect_stderr(output):
            test_retrieval.report_error(ValueError("secret-provider-body"))
        self.assertNotIn("secret", output.getvalue())

    def test_performance_cli_offline_and_failure_closes_remote_client(self):
        self.corpus()
        with patch.object(performance_test, "load_settings", return_value=self.settings), \
             patch.object(performance_test, "QwenKnowledgeSystem") as create, \
             redirect_stdout(io.StringIO()):
            self.assertEqual(performance_test.main([]), 0)
        create.assert_not_called()
        knowledge = Mock(settings=self.settings)
        knowledge.hybrid_search.side_effect = RuntimeError("private-provider-body")
        with patch.object(performance_test, "load_settings", return_value=self.settings), \
             patch.object(performance_test, "QwenKnowledgeSystem", return_value=knowledge), \
             redirect_stderr(io.StringIO()):
            self.assertEqual(performance_test.main(["--remote"]), 1)
        knowledge.close.assert_called_once()

    def test_cache_benchmark_uses_nine_tool_steps_and_closes(self):
        knowledge, client = self.knowledge()
        knowledge.update_vectors()
        client.embeddings.create.reset_mock()
        settings = replace(self.settings, dashscope_api_key="fake")
        with patch.object(benchmark_cache, "load_settings", return_value=settings), \
             patch.object(benchmark_cache, "QwenKnowledgeSystem", return_value=knowledge), \
             patch.object(knowledge, "close", wraps=knowledge.close) as close, \
             redirect_stdout(io.StringIO()) as output:
            self.assertEqual(benchmark_cache.main(), 0)
        self.assertEqual(client.embeddings.create.call_count, 3)
        self.assertIn('"tool_calls": 9', output.getvalue())
        close.assert_called_once()

    def test_scripts_cannot_directly_call_model_or_retrieval_internals(self):
        forbidden = {"complete_chat", "complete_model", "hybrid_search", "semantic_search",
                     "get_embedding", "rerank", "_query_vector"}
        scripts = Path(__file__).resolve().parents[1] / "scripts"
        for path in scripts.glob("*.py"):
            tree = ast.parse(path.read_text(encoding="utf-8"))
            for call in (node for node in ast.walk(tree) if isinstance(node, ast.Call)):
                name = call.func.attr if isinstance(call.func, ast.Attribute) else (
                    call.func.id if isinstance(call.func, ast.Name) else "")
                self.assertNotIn(name, forbidden, str(path))
