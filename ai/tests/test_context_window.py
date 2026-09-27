"""Model window configuration and conservative sizing, without network calls."""
import os
import tempfile
import unittest
import io
from contextlib import redirect_stdout
from dataclasses import replace
from pathlib import Path
from unittest.mock import patch

from ai.src.llm import ChatModel, ModelResponse
from ai.src.runtime.context import Budget, Limits, Policy
from ai.src.runtime.contracts import Contract, RuntimeFault, json_text
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.runtime.model import call_model
from ai.src.runtime.runner import Result, Runner
from ai.src.runtime.window import ModelWindow, TokenMeter, model_window
from ai.src.settings import Settings, load_settings
from ai.tests.test_runtime import RuntimeFixture, ScriptedModel
from ai.scripts import verify_context_window as probe


class WindowSettingsTests(unittest.TestCase):
    def test_live_probe_requires_explicit_execute_and_does_not_load_secrets_in_preview(self):
        with patch.object(probe, "load_settings") as load, redirect_stdout(io.StringIO()):
            self.assertEqual(probe.main([]), 0)
            load.assert_not_called()

    def test_probe_uses_provider_usage_and_does_not_hide_missing_usage_or_failures(self):
        model = ScriptedModel(ModelResponse("OK", usage={"prompt_tokens": 30}),
                              ModelResponse("OK"), ModelResponse("OK", usage={"prompt_tokens": 99999}))
        report = probe.run_cases(model)
        self.assertFalse(report["passed"])
        self.assertEqual([case["passed"] for case in report["cases"]], [True, False, False])
        self.assertEqual(len(model.inputs), 3)
        def fail(*args, **kwargs):
            raise RuntimeError("private error text")
        report = probe.run_cases(ScriptedModel(fail, fail, fail))
        self.assertNotIn("private", json_text(report))
        self.assertEqual([case["model_calls"] for case in report["cases"]], [1, 1, 1])
        report = probe.run_cases(ScriptedModel(ModelResponse("OK", usage={"prompt_tokens": 30})),
                                 only="tool_history")
        self.assertEqual([case["case"] for case in report["cases"]], ["tool_history"])
        self.assertTrue(report["passed"])
        with self.assertRaisesRegex(ValueError, "unknown_case"):
            probe.run_cases(ScriptedModel(), only="unknown")

    def test_default_is_decimal_one_million_and_output_remains_separate(self):
        with tempfile.TemporaryDirectory() as folder, patch.dict(os.environ, {}, clear=True):
            settings = load_settings(Path(folder) / "missing.env")
        self.assertEqual(settings.context_window_tokens, 1_000_000)
        self.assertEqual(settings.max_tokens, 2048)

    def test_process_overrides_file_and_model_switch_updates_its_capacity(self):
        with tempfile.TemporaryDirectory() as folder:
            env_file = Path(folder) / ".env"
            env_file.write_text("OPENAI_MODEL=first\nOPENAI_CONTEXT_WINDOW_TOKENS=32000\n"
                                "OPENAI_MAX_TOKENS=4096\nOPENAI_MODEL_MAX_OUTPUT_TOKENS=8192\n", encoding="utf-8")
            with patch.dict(os.environ, {}, clear=True):
                first = load_settings(env_file)
            with patch.dict(os.environ, {"OPENAI_MODEL": "second",
                                        "OPENAI_CONTEXT_WINDOW_TOKENS": "128000",
                                        "OPENAI_MODEL_MAX_OUTPUT_TOKENS": "32768"}, clear=True):
                second = load_settings(env_file)
        self.assertEqual((first.chat_model, first.context_window_tokens), ("first", 32000))
        self.assertEqual((second.chat_model, second.context_window_tokens), ("second", 128000))
        self.assertEqual(second.max_tokens, 4096)
        self.assertEqual((first.model_max_output_tokens, second.model_max_output_tokens), (8192, 32768))
        self.assertEqual(model_window(ChatModel(first, None)).tokens, 32000)
        self.assertEqual(model_window(ChatModel(second, None)).tokens, 128000)

    def test_explicit_invalid_values_fail_instead_of_falling_back(self):
        for value in ("", " ", "0", "-1", "1M", "1000000.5", "nan", "inf", "true", "2048"):
            with self.subTest(value=value), tempfile.TemporaryDirectory() as folder, \
                    patch.dict(os.environ, {"OPENAI_CONTEXT_WINDOW_TOKENS": value}, clear=True):
                with self.assertRaises(ValueError):
                    load_settings(Path(folder) / "missing.env")
        for value in (True, 1.5, None, float("inf")):
            with self.subTest(value=value), self.assertRaises(ValueError):
                Settings(context_window_tokens=value)

    def test_invalid_file_value_fails_and_valid_environment_takes_precedence(self):
        with tempfile.TemporaryDirectory() as folder:
            env_file = Path(folder) / ".env"
            env_file.write_text("OPENAI_CONTEXT_WINDOW_TOKENS=\n", encoding="utf-8")
            with patch.dict(os.environ, {}, clear=True), self.assertRaises(ValueError):
                load_settings(env_file)
            with patch.dict(os.environ, {"OPENAI_CONTEXT_WINDOW_TOKENS": "64000",
                                        "OPENAI_MODEL_MAX_OUTPUT_TOKENS": "8192"}, clear=True):
                self.assertEqual(load_settings(env_file).context_window_tokens, 64000)

    def test_output_must_leave_input_and_safety_space(self):
        for value in (True, 0, -1, 32000):
            with self.subTest(value=value), self.assertRaises(ValueError):
                Settings(context_window_tokens=32000, max_tokens=value)
        self.assertEqual(Settings(max_tokens=128000).context_window_tokens, 1_000_000)


class WindowMeterTests(unittest.TestCase):
    def test_complete_envelope_chinese_and_tool_overhead_are_counted(self):
        window = ModelWindow(32000)
        base = [{"role": "system", "content": "专业指导"},
                {"role": "user", "content": "条件是多少？"}]
        tools = [{"type": "function", "function": {
            "name": "source_read", "description": "读取授权源码", "parameters": {
                "type": "object", "properties": {"path": {"type": "string"}}}}}]
        messages = base + [{"role": "assistant", "content": None, "tool_calls": [
            {"id": "read-1", "type": "function", "function": {
                "name": "source_read", "arguments": '{"path":"技能.lpc"}'}}]},
            {"role": "tool", "tool_call_id": "read-1", "content": "贡献门槛1000，扣除100。"}]
        size = window.measure(messages, tools, 1024)
        serialized = json_text({"messages": messages, "tools": tools}, None)
        self.assertEqual(size.input_tokens, len(serialized.encode("utf-8")) + 64 + 32 * 4 + 64)
        self.assertGreater(size.input_tokens, window.measure(base, [], 1024).input_tokens)
        self.assertEqual(size.method, "utf8_conservative_v1")
        self.assertEqual(size.output_tokens, 1024)
        self.assertEqual(size.safety_tokens, 320)
        latin = window.measure([{"role": "user", "content": "abc"}], [], 1)
        chinese = window.measure([{"role": "user", "content": "甲乙丙"}], [], 1)
        self.assertEqual(chinese.input_tokens - latin.input_tokens, 6)

    def test_threshold_before_at_after_and_output_reservation(self):
        window = ModelWindow(10000)
        messages = [{"role": "user", "content": ""}]
        overhead = window.measure(messages, [], 1).input_tokens
        for count in (7999, 8000, 8001):
            messages[0]["content"] = "x" * (count - overhead)
            size = window.measure(messages, [], 1)
            self.assertEqual(size.input_tokens, count)
            self.assertEqual(size.needs_compaction, count >= 8000)
        messages[0]["content"] = "x" * (7000 - overhead)
        size = window.measure(messages, [], 3000)
        self.assertTrue(size.needs_compaction)
        self.assertFalse(size.fits)
        with self.assertRaisesRegex(RuntimeFault, "context_window_exceeded"):
            window.require_fit(size)

    def test_exact_fit_includes_safety_margin(self):
        window = ModelWindow(10000)
        messages = [{"role": "user", "content": ""}]
        overhead = window.measure(messages, [], 1000).input_tokens
        messages[0]["content"] = "x" * (8900 - overhead)
        self.assertTrue(window.measure(messages, [], 1000).fits)
        messages[0]["content"] += "x"
        self.assertFalse(window.measure(messages, [], 1000).fits)


class ProviderAnchorTests(unittest.TestCase):
    def setUp(self):
        self.model = ScriptedModel()
        self.model.context_window_tokens = 16000
        self.meter = TokenMeter()
        self.messages = [{"role": "system", "content": "系统约束"},
                         {"role": "user", "content": "中文资料" * 500}]
        self.tools = [{"type": "function", "function": {"name": "lookup"}}]

    def anchor(self, usage=None):
        self.meter.observe(self.model, self.messages, self.tools, 1000,
                           usage if usage is not None else {"prompt_tokens": 2100})

    def test_provider_anchor_counts_only_new_material_and_not_completion_or_cache_twice(self):
        self.anchor({"prompt_tokens": 2100, "completion_tokens": 400, "total_tokens": 2500,
                     "cached_tokens": 2000})
        exact = self.meter.measure(self.model, self.messages, self.tools, 1000)
        self.assertEqual(exact.input_tokens, 2100)
        grown = self.messages + [{"role": "assistant", "content": "结论"},
                                 {"role": "user", "content": "核对门槛与扣除"}]
        window = model_window(self.model)
        delta = window.measure(grown, self.tools, 1000).input_tokens - window.measure(
            self.messages, self.tools, 1000).input_tokens
        size = self.meter.measure(self.model, grown, self.tools, 1000)
        self.assertEqual(size.input_tokens, 2100 + delta)
        self.assertEqual(size.method, "provider_anchor_utf8_delta_v1")

    def test_changed_prefix_tools_or_model_binding_invalidates_calibration(self):
        self.anchor()
        changed = [{"role": "system", "content": "不同约束"}, *self.messages[1:]]
        for messages, tools in ((changed, self.tools), (self.messages, []),
                                (self.messages[1:], self.tools)):
            self.assertEqual(self.meter.measure(self.model, messages, tools, 1000).method,
                             "utf8_conservative_v1")
        self.model.context_window_tokens = 32000
        self.assertEqual(self.meter.measure(self.model, self.messages, self.tools, 1000).method,
                         "utf8_conservative_v1")
        self.model.context_window_tokens = 16000
        self.model.context_identity = "changed-model"
        self.assertEqual(self.meter.measure(self.model, self.messages, self.tools, 1000).method,
                         "utf8_conservative_v1")

    def test_missing_or_invalid_usage_does_not_become_a_zero_token_anchor(self):
        for usage in ({}, {"prompt_tokens": 0}, {"prompt_tokens": True},
                      {"prompt_tokens": -1}, {"prompt_tokens": 2.5}):
            self.anchor()
            self.anchor(usage)
            self.assertEqual(self.meter.measure(self.model, self.messages, self.tools, 1000).method,
                             "utf8_conservative_v1")

    def test_provider_above_fallback_is_not_capped_and_can_trigger_compaction(self):
        self.anchor({"prompt_tokens": 13000})
        self.assertTrue(self.meter.measure(self.model, self.messages, self.tools, 1000).needs_compaction)


class WindowRuntimeTests(RuntimeFixture):
    def test_shared_model_boundary_uses_provider_anchor_and_keeps_usage_separate(self):
        model = ScriptedModel(ModelResponse("第一步", usage={"prompt_tokens": 30, "total_tokens": 35}),
                              ModelResponse("第二步", usage={"prompt_tokens": 50, "total_tokens": 55}))
        agent, context = self.agent(mode="single"), self.context()
        runner = Runner(model)
        events = []
        hooks = Hooks([Hook("after_model", lambda event: events.append(dict(event)))])
        messages = [{"role": "user", "content": "核对贡献门槛"}]
        call_model(model, messages, [], agent, context, hooks, runner._messages)
        grown = messages + [{"role": "assistant", "content": "第一步"},
                            {"role": "user", "content": "继续"}]
        expected = context.state.token_meter.measure(model, grown, [], agent.max_tokens)
        call_model(model, grown, [], agent, context, hooks, runner._messages)
        self.assertEqual(events[-1]["context_tokens_estimated"], expected.input_tokens)
        self.assertEqual(events[-1]["token_estimation"], "provider_anchor_utf8_delta_v1")
        self.assertEqual(context.budget.usage["prompt_tokens"], 80)
        self.assertEqual(context.budget.usage["total_tokens"], 90)

    def test_history_over_128_kib_and_cumulative_bytes_over_one_mib_are_allowed(self):
        # A small business input may produce a much larger authorized history.
        history = [{"role": "system", "content": "规则"},
                   {"role": "user", "content": "资料" * 40000}]
        agent = self.agent(mode="single", messages=lambda ctx, payload: history)
        root = self.context()
        # Prior operations must not cause a byte budget rejection later.
        root.budget.reserve(root.deadline, total_bytes=4_000_000)
        captured = []
        hooks = Hooks([Hook("before_model", lambda event: captured.append(event) or Decision(),
                            intervention=True, raw_data=True)])
        model = ScriptedModel(ModelResponse("done"))
        outcome = Runner(model, [agent], hooks=hooks).run("answer", {"goal": "x"}, root)
        self.assertEqual(outcome.result.status, "completed")
        self.assertEqual(len(captured[0]["data"]["messages"][1]["content"]), 80000)
        self.assertEqual(model.inputs[0], history)
        self.assertGreater(root.budget.counts["total_bytes"], 4_240_000)

    def test_large_raw_model_response_is_distinct_from_business_result(self):
        response = "分析资料" * 15000
        model = ScriptedModel(ModelResponse(response))
        agent = self.agent(mode="single", max_tokens=128000,
                          parse=lambda text: Result("completed", "done" if text == response else "wrong"))
        captured = []
        hooks = Hooks([Hook("after_model", lambda event: captured.append(event) or Decision(),
                            intervention=True, raw_data=True)])
        result = Runner(model, [agent], hooks=hooks).run("answer", {"goal": "x"}, self.context())
        self.assertEqual(result.result.value, "done")
        self.assertEqual(captured[0]["data"]["text"], response)
        self.assertEqual(result.context.budget.counts["model_calls"], 1)

    def test_final_business_payload_limit_is_still_enforced(self):
        model = ScriptedModel(ModelResponse("x" * 33000))
        result = Runner(model, [self.agent(mode="single", max_tokens=64000)]).run(
            "answer", {"goal": "x"}, self.context())
        self.assertEqual(result.result.code, "size_limit")
        with self.assertRaisesRegex(RuntimeFault, "size_limit"):
            Contract({"type": "string"}).validate("x" * 33000, 32768)

    def test_post_hook_additions_are_measured_before_dispatch(self):
        model = ScriptedModel(ModelResponse("must not be called"))
        model.context_window_tokens = 5000
        agent = self.agent(mode="single")
        events = []
        policy = Policy(agents={"answer"}, scopes={"public"}, egress_scopes={"public"})
        hooks = Hooks([
            Hook("before_model", lambda event: Decision(changes={"additional_context": [
                {"text": "资" * 1000, "scope": "public"}]}), intervention=True),
            Hook("after_model", lambda event: events.append(dict(event)))])
        outcome = Runner(model, [replace(agent, policy=policy)], hooks=hooks).run(
            "answer", {"goal": "x"}, self.context(policy=policy))
        self.assertEqual(outcome.result.code, "context_window_exceeded")
        self.assertFalse(model.inputs)
        self.assertFalse(events[0]["executed"])
        self.assertEqual(outcome.context.budget.counts["model_calls"], 0)

    def test_permitted_hook_content_and_estimate_reach_model_and_metadata(self):
        model = ScriptedModel(ModelResponse("done", usage={"prompt_tokens": 20, "total_tokens": 21}))
        policy = Policy(agents={"answer"}, scopes={"public"}, egress_scopes={"public"})
        events = []
        hooks = Hooks([
            Hook("before_model", lambda event: Decision(changes={"additional_context": [
                {"text": "补充", "scope": "public"}]}), intervention=True),
            Hook("after_model", lambda event: events.append(dict(event)))])
        outcome = Runner(model, [self.agent(mode="single", policy=policy)], hooks=hooks).run(
            "answer", {"goal": "x"}, self.context(policy=policy))
        self.assertEqual(outcome.result.status, "completed")
        self.assertEqual(model.inputs[0][-1], {"role": "user", "content": "补充"})
        expected = ModelWindow().measure(model.inputs[0], [], 2048)
        self.assertEqual(events[0]["context_tokens_estimated"], expected.input_tokens)
        self.assertEqual(events[0]["token_estimation"], "utf8_conservative_v1")
        self.assertEqual(outcome.context.budget.usage["prompt_tokens"], 20)

    def test_tool_definitions_can_exhaust_small_window_even_for_short_question(self):
        model = ScriptedModel(ModelResponse("must not run"))
        model.context_window_tokens = 5000
        tools = self.tools()
        # Registry-owned schema content is part of every tool-enabled request.
        definitions = [{"type": "function", "function": {"name": "lookup",
                         "description": "文" * 1500, "parameters": {"type": "object"}}}]
        with patch.object(tools, "definitions", return_value=definitions):
            outcome = Runner(model, [self.agent()], tools).run("answer", {"goal": "x"}, self.context())
        self.assertEqual(outcome.result.code, "context_window_exceeded")
        self.assertEqual(model.inputs, [])

    def test_parent_child_model_windows_are_independent_and_usage_is_shared(self):
        policy = Policy(agents={"answer", "child"})
        root = self.context(policy=policy)
        large, small = ScriptedModel(ModelResponse("parent")), ScriptedModel(ModelResponse("child"))
        large.context_window_tokens, small.context_window_tokens = 64000, 8000
        history = lambda ctx, payload: [{"role": "user", "content": "x" * 12000}]
        parent = Runner(large, [self.agent(mode="single", policy=policy, messages=history)]).run(
            "answer", {"goal": "x"}, root)
        self.assertEqual(parent.result.status, "completed")
        child_runner = Runner(small, [self.agent(name="child", mode="single", policy=policy, messages=history)])
        child = child_runner.run("child", {"goal": "x"}, parent.context, delegated=True)
        self.assertEqual(child.result.code, "context_window_exceeded")
        self.assertFalse(small.inputs)
        self.assertEqual(child.context.root_id, parent.context.root_id)
        self.assertEqual(root.budget.counts["model_calls"], 1)
        self.assertEqual(root.budget.counts["delegations"], 1)
        self.assertIs(child.context.budget.cancelled, parent.context.budget.cancelled)
        self.assertIsNot(child.context.state.token_meter, parent.context.state.token_meter)

    def test_invalid_model_output_binding_is_rejected_during_assembly(self):
        model = ScriptedModel()
        model.context_window_tokens = 1000
        with self.assertRaises(ValueError):
            Runner(model, [self.agent()])

    def test_cumulative_byte_accounting_remains_atomic_and_validated(self):
        root = Budget()
        child = Budget(Limits(), root)
        deadline = self.context().deadline
        child.reserve(deadline, total_bytes=10_000_000)
        self.assertEqual(child.counts["total_bytes"], root.counts["total_bytes"])
        with self.assertRaises(ValueError):
            child.reserve(deadline, total_bytes=-1)
        root.cancelled.set()
        with self.assertRaisesRegex(RuntimeFault, "cancelled"):
            child.reserve(deadline, total_bytes=1)
        self.assertEqual(root.counts["total_bytes"], 10_000_000)
