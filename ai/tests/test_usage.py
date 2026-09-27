"""Usage receipts and diagnostic prices; fake providers, temporary stores only."""
import json
import os
import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from types import SimpleNamespace
from unittest.mock import Mock, patch

from ai.src.llm import ChatModel, ModelResponse, ModelUnavailable
from ai.src.runtime.context import Budget, Limits
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.runtime.remote import remote_call
from ai.src.runtime.model import call_model
from ai.src.runtime.runner import Runner
from ai.src.runtime.usage import normalize_usage
from ai.src.settings import Settings, load_settings
from ai.src.usage_report import usage_report
from ai.tests.test_npc_ai import Fixture
from ai.tests.test_runtime import RuntimeFixture, ScriptedModel


KNOWN = dict(prompt_tokens=100, completion_tokens=20, total_tokens=120, cached_prompt_tokens=40)


class UsageTests(RuntimeFixture):
    def test_provider_cached_tokens_are_input_subset_and_missing_stays_unknown(self):
        raw = SimpleNamespace(prompt_tokens=100, completion_tokens=20, total_tokens=120,
                              prompt_tokens_details=SimpleNamespace(cached_tokens=40))
        self.assertEqual(normalize_usage(raw), KNOWN)
        self.assertEqual(normalize_usage({"prompt_tokens": 12}), {"prompt_tokens": 12})
        self.assertEqual(normalize_usage({"prompt_tokens": True, "completion_tokens": -1}), {})
        self.assertNotIn("cached_prompt_tokens", normalize_usage({**KNOWN, "cached_prompt_tokens": 101}))
        self.assertEqual(normalize_usage({"input_tokens": 8}, "rerank"),
                         dict(prompt_tokens=8, completion_tokens=0, total_tokens=8))

    def test_concurrent_sibling_settlement_does_not_hide_missing_receipt(self):
        root = replace(self.context(), deadline=None)
        entered, reported = threading.Event(), threading.Event()
        def unknown(*args, **kwargs):
            entered.set()
            self.assertTrue(reported.wait(2))
            raise ModelUnavailable("timeout")
        def run_missing():
            return Runner(ScriptedModel(unknown), [self.agent()]).run("answer", {"goal": "x"}, root)
        with ThreadPoolExecutor(2) as pool:
            failed = pool.submit(run_missing)
            self.assertTrue(entered.wait(2))
            good = Runner(ScriptedModel(ModelResponse("done", usage=KNOWN)), [self.agent()]).run(
                "answer", {"goal": "x"}, root)
            reported.set()
            self.assertEqual(failed.result().result.code, "timeout")
        ledger = root.budget.snapshot()
        self.assertEqual(ledger["usage_reports"], 2)
        self.assertEqual(ledger["usage_incomplete_reports"], 1)
        self.assertEqual(ledger["usage"], KNOWN)
        self.assertEqual(ledger["usage_unknown"], dict.fromkeys(KNOWN, 1))
        self.assertEqual(good.context.budget.snapshot()["usage_reports"], 1)
        self.assertEqual(ledger["usage_groups"][0]["statuses"], {"completed": 1, "timeout": 1})

    def test_child_summary_compact_groups_count_once_in_ancestors(self):
        root = replace(self.context(limits=Limits(model_calls=0, external_calls=0)), deadline=None)
        primary = Runner(ScriptedModel(ModelResponse("done", usage=KNOWN)), [self.agent()]).run(
            "answer", {"goal": "x"}, root)
        for operation in ("summary", "compact"):
            child = replace(self.agent(), name="child", operation=operation)
            result = Runner(ScriptedModel(ModelResponse("done", usage=KNOWN)), [child]).run(
                "child", {"goal": "x"}, primary.context, delegated=True)
            self.assertEqual(result.context.budget.snapshot()["usage_reports"], 1)
        ledger = root.budget.snapshot()
        self.assertEqual(ledger["model_calls"], 3)
        self.assertEqual(ledger["usage"]["total_tokens"], 360)
        self.assertEqual(ledger["usage"]["cached_prompt_tokens"], 120)
        self.assertEqual({(row["operation"], row["role"]) for row in ledger["usage_groups"]},
                         {("agent", "primary"), ("summary", "child"), ("compact", "child")})
        ledger["usage_groups"][0]["usage"]["total_tokens"] = 0
        self.assertEqual(root.budget.snapshot()["usage"]["total_tokens"], 360)

    def test_late_cancelled_usage_is_kept_and_preflight_denial_is_not_a_call(self):
        root = self.context()
        def late(*args, **kwargs):
            root.budget.cancelled.set()
            return ModelResponse("late", usage=KNOWN)
        result = Runner(ScriptedModel(late), [self.agent()]).run("answer", {"goal": "x"}, root)
        self.assertEqual(result.result.status, "cancelled")
        self.assertEqual(root.budget.snapshot()["usage_groups"][0]["statuses"], {"cancelled": 1})
        root = self.context()
        hooks = Hooks([Hook("before_model", lambda e: Decision("deny"), intervention=True)])
        Runner(ScriptedModel(), [self.agent()], hooks=hooks).run("answer", {"goal": "x"}, root)
        self.assertEqual(root.budget.snapshot()["usage_reports"], 0)

    def test_compact_receipt_excludes_other_usage_settled_during_call(self):
        root = self.context()
        record = {"model_calls": 0}
        def compact(*args, **kwargs):
            sibling = Budget(parent=root.budget)
            sibling.record_usage({"prompt_tokens": 900, "completion_tokens": 100, "total_tokens": 1000},
                                 agent="sibling")
            return ModelResponse("summary", usage=KNOWN)
        model = ScriptedModel(compact)
        call_model(model, [{"role": "user", "content": "summarize"}], [], self.agent(operation="compact"),
                   root, Hooks(), Runner(model)._messages, usage_record=record)
        self.assertEqual(record["model_calls"], 1)
        self.assertEqual(record["usage"], KNOWN)
        self.assertEqual(root.budget.snapshot()["usage"]["total_tokens"], 1120)

    def test_sdk_invalid_response_keeps_usage_without_double_accounting(self):
        client = Mock()
        client.with_options.return_value = client
        client.chat.completions.create.return_value = SimpleNamespace(
            choices=[SimpleNamespace(finish_reason="length")], usage=SimpleNamespace(**KNOWN))
        root = self.context()
        result = Runner(ChatModel(Settings(), client), [self.agent()]).run("answer", {"goal": "x"}, root)
        self.assertEqual(result.result.code, "truncated")
        ledger = root.budget.snapshot()
        self.assertEqual(ledger["usage"], KNOWN)
        self.assertEqual(ledger["usage_reports"], 1)
        self.assertEqual(ledger["usage_groups"][0]["statuses"], {"failed": 1})

    def test_remote_timeout_missing_and_partial_usage_are_explicit(self):
        root = self.context()
        with self.assertRaises(TimeoutError):
            remote_call("embedding", {}, Mock(side_effect=TimeoutError()), root)
        remote_call("embedding", {}, lambda: SimpleNamespace(), root)
        remote_call("embedding", {}, lambda: SimpleNamespace(usage={"prompt_tokens": 7}), root)
        ledger = root.budget.snapshot()
        self.assertEqual(ledger["external_calls"], 3)
        self.assertEqual(ledger["usage_reports"], 3)
        self.assertEqual(ledger["usage_incomplete_reports"], 2)
        self.assertEqual(ledger["usage"]["total_tokens"], 7)
        self.assertEqual(ledger["usage_unknown"]["prompt_tokens"], 2)

    def test_configured_prices_and_cached_subset_are_not_double_counted(self):
        budget = Budget()
        budget.record_usage(KNOWN, model="fixture")
        prices = {"chat:fixture": {"input": 10, "cached_input": 1, "output": 20}}
        report = usage_report(budget.snapshot(), prices, successful_tasks=1)
        self.assertAlmostEqual(report["estimated_total_cost"], .00104)
        self.assertEqual(report["cost_unknown_calls"], 0)
        self.assertAlmostEqual(report["cost_per_successful_task"], .00104)
        self.assertEqual(report["groups"][0]["rates_per_million"], prices["chat:fixture"])

    def test_unknown_prices_cache_or_usage_never_become_free(self):
        budget = Budget()
        budget.record_usage(KNOWN, model="fixture")
        self.assertIsNone(usage_report(budget.snapshot())["estimated_total_cost"])
        budget.record_usage({key: value for key, value in KNOWN.items() if key != "cached_prompt_tokens"},
                            model="fixture")
        prices = {"chat:fixture": {"input": 10, "cached_input": 1, "output": 20}}
        report = usage_report(budget.snapshot(), prices)
        self.assertEqual(report["groups"][0]["cost_unknown_reason"], "cached_usage_unknown")
        # Explicit flat input pricing can estimate without provider cache detail.
        report = usage_report(budget.snapshot(), {"chat:fixture": {"input": 10, "output": 20}})
        self.assertAlmostEqual(report["estimated_total_cost"], .0028)
        budget.record_usage({}, model="fixture", status="timeout")
        self.assertIsNone(usage_report(budget.snapshot(), prices)["estimated_total_cost"])

    def test_success_cost_includes_failed_attempts_and_separate_models(self):
        budget = Budget()
        budget.record_usage(KNOWN, model="a")
        budget.record_usage(KNOWN, model="b", status="failed", role="child", operation="compact")
        prices = {"chat:a": {"input": 10, "output": 20}, "chat:b": {"input": 20, "output": 40}}
        report = usage_report(budget.snapshot(), prices, successful_tasks=1)
        self.assertAlmostEqual(report["cost_per_successful_task"], .0042)
        self.assertIsNone(usage_report(budget.snapshot(), prices, successful_tasks=0)["cost_per_successful_task"])
        self.assertEqual(usage_report(Budget().snapshot())["estimated_total_cost"], 0)


class ProviderUsageTests(Fixture):
    def test_rerank_native_usage_and_invalid_output_still_accounted(self):
        knowledge, _ = self.knowledge()
        knowledge.settings.dashscope_api_key = "fixture"
        root = RuntimeFixture().context()
        document = {"title": "入门", "content": "贡献200", "id": "fixture"}
        response = Mock()
        response.json.return_value = {"usage": {"total_tokens": 73},
                                      "output": {"results": [{"index": 0, "relevance_score": .9}]}}
        with patch("ai.src.knowledge_qwen.httpx.post", return_value=response):
            self.assertEqual(knowledge.rerank("贡献", [document], 1, context=root)[0]["id"], "fixture")
            response.json.return_value["output"]["results"][0]["index"] = 3
            with self.assertRaises(ValueError):
                knowledge.rerank("贡献", [document], 1, context=root)
        ledger = root.budget.snapshot()
        self.assertEqual(ledger["usage_reports"], 2)
        self.assertEqual(ledger["usage"]["prompt_tokens"], 146)
        self.assertEqual(ledger["usage_groups"][0]["statuses"], {"completed": 1, "failed": 1})

    def test_local_vector_cache_is_not_provider_cached_tokens_or_new_request(self):
        knowledge, client = self.knowledge()
        client.embeddings.create.side_effect = None
        client.embeddings.create.return_value = SimpleNamespace(usage={"prompt_tokens": 9, "total_tokens": 9},
                                                               data=[SimpleNamespace(embedding=[1, 0, 0, 0])])
        context = RuntimeFixture().context()
        knowledge._query_vector("贡献", context=context)
        knowledge._query_vector("贡献", context=context)
        self.assertEqual(client.embeddings.create.call_count, 1)
        self.assertEqual(context.budget.snapshot()["usage_reports"], 1)
        self.assertEqual(context.budget.snapshot()["usage_unknown"]["cached_prompt_tokens"], 1)
        self.assertEqual(knowledge.cache_stats["hits"], 1)

    def test_price_config_optional_validated_and_process_overrides_env(self):
        self.assertEqual(Settings().model_prices_per_million, {})
        for prices in ([], {"bad": {}}, {"chat:test": {"input": -1}},
                       {"chat:test": {"input": True}}, {"chat:test": {"input": float("nan")}}):
            with self.subTest(prices=prices), self.assertRaises(ValueError):
                Settings(model_prices_per_million=prices)
        env = self.root / "fixture.env"
        env.write_text('MODEL_PRICES_PER_MILLION={"chat:fixture":{"input":1,"output":2}}\nCOST_CURRENCY=CNY\n',
                       encoding="utf-8")
        with patch.dict(os.environ, {"MODEL_PRICES_PER_MILLION": '{"chat:fixture":{"input":3,"output":4}}'},
                        clear=True):
            settings = load_settings(env)
        self.assertEqual(settings.model_prices_per_million["chat:fixture"]["input"], 3)
        json.dumps(usage_report(Budget().snapshot(), settings.model_prices_per_million))
