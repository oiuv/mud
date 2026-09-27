"""Native JSON Object is opt-in; local contracts and text compaction stay intact."""
import copy
import json
from dataclasses import replace
from types import SimpleNamespace as NS
from unittest.mock import Mock

from ai.src.llm import ChatModel, ModelUnavailable, complete_chat, complete_model
from ai.src.runtime.compaction import Compactor
from ai.src.runtime.contracts import Contract, parse_json
from ai.src.runtime.hooks import Hooks
from ai.src.runtime.model import call_model
from ai.src.runtime.runner import Result, Runner
from ai.src.runtime.window import ModelWindow, TokenMeter
from ai.src.settings import Settings
from ai.tests.test_compaction import history
from ai.tests.test_runtime import RuntimeFixture


OUTPUT = Contract({"type": "object", "properties": {"answer": {"type": "integer"}},
                   "required": ["answer"], "additionalProperties": False})


def response(content=None, *, calls=None, reasoning=None):
    return NS(choices=[NS(finish_reason="tool_calls" if calls else "stop",
                         message=NS(content=content, tool_calls=calls, reasoning_content=reasoning))],
              usage=NS(prompt_tokens=30, completion_tokens=10, total_tokens=40))


class JsonOutputTests(RuntimeFixture):
    def setUp(self):
        self.settings = Settings()
        self.client = Mock()
        self.client.with_options.return_value = self.client
        self.model = ChatModel(self.settings, self.client)

    def json_agent(self, **kwargs):
        return self.agent(json_output=True, outputs=OUTPUT,
                          parse=lambda text: Result("completed", parse_json(text)), **kwargs)

    def test_json_object_is_sent_without_provider_output_cap(self):
        self.client.chat.completions.create.return_value = response('{"answer":42}')
        result = Runner(self.model, [self.json_agent(mode="single")]).run(
            "answer", {"goal": "计算答案"}, self.context())
        self.assertEqual(result.result.value, {"answer": 42})
        options = self.client.chat.completions.create.call_args.kwargs
        self.assertEqual(options["response_format"], {"type": "json_object"})
        self.assertNotIn("max_tokens", options)
        self.assertTrue(any("json" in (m.get("content") or "").lower() for m in options["messages"]))
        self.assertEqual(result.context.budget.counts["model_calls"], 1)

    def test_default_agent_and_text_wrapper_remain_text(self):
        self.client.chat.completions.create.return_value = response("自然语言回答")
        result = Runner(self.model, [self.agent(mode="single")]).run(
            "answer", {"goal": "普通问题"}, self.context())
        self.assertEqual(result.result.value, "自然语言回答")
        complete_chat(self.settings, self.client, [{"role": "user", "content": "摘要"}], max_tokens=512)
        for call in self.client.chat.completions.create.call_args_list:
            self.assertNotIn("response_format", call.kwargs)
            self.assertIn("max_tokens", call.kwargs)
        self.assertEqual(self.client.chat.completions.create.call_args.kwargs["max_tokens"], 512)

    def test_json_tool_roundtrip_keeps_reasoning_and_usage(self):
        tool = NS(id="read-1", type="function", function=NS(name="lookup", arguments='{"q":"entry"}'))
        self.client.chat.completions.create.side_effect = [
            response(calls=[tool], reasoning="private intermediate reasoning"), response('{"answer":42}')]
        result = Runner(self.model, [self.json_agent()], self.tools()).run(
            "answer", {"goal": "读取规则后回答"}, self.context())
        self.assertEqual(result.result.value, {"answer": 42})
        self.assertEqual(result.context.budget.usage["total_tokens"], 80)
        self.assertEqual(result.context.budget.counts["tool_calls"], 1)
        calls = self.client.chat.completions.create.call_args_list
        for call in calls:
            self.assertEqual(call.kwargs["response_format"], {"type": "json_object"})
            self.assertNotIn("max_tokens", call.kwargs)
        messages = calls[1].kwargs["messages"]
        self.assertTrue(any(m.get("reasoning_content") == "private intermediate reasoning" for m in messages))
        self.assertTrue(any(m.get("tool_call_id") == "read-1" for m in messages))
        self.assertNotIn("private", json.dumps(result.result.value))

    def test_json_does_not_replace_local_shape_or_evidence_checks(self):
        for content, verify in (("{\"answer\":\"42\"}", lambda value, ctx: ()),
                                ('{"answer":42}', lambda value, ctx: ("missing_evidence",))):
            with self.subTest(content=content):
                self.client.chat.completions.create.reset_mock()
                self.client.chat.completions.create.return_value = response(content)
                result = Runner(self.model, [self.json_agent(mode="single", verify=verify)]).run(
                    "answer", {"goal": "回答"}, self.context())
                self.assertNotEqual(result.result.status, "completed")
                self.client.chat.completions.create.assert_called_once()

    def test_existing_loop_can_correct_contract_using_same_model(self):
        self.client.chat.completions.create.side_effect = [response('{"answer":"42"}'), response('{"answer":42}')]
        result = Runner(self.model, [self.json_agent()]).run("answer", {"goal": "回答"}, self.context())
        self.assertEqual(result.result.value, {"answer": 42})
        self.assertEqual(self.client.chat.completions.create.call_count, 2)
        self.assertIn("contract_violation", str(self.client.chat.completions.create.call_args.kwargs["messages"]))

    def test_unsupported_json_is_explicit_without_silent_fallback(self):
        settings = replace(self.settings, chat_supports_json_object=False)
        with self.assertRaisesRegex(ModelUnavailable, "unsupported_json_object"):
            complete_model(settings, self.client, [], json_output=True)
        self.client.with_options.assert_not_called()

    def test_json_capacity_reserves_model_maximum_and_format_bytes(self):
        messages = [{"role": "user", "content": "JSON"}]
        meter = TokenMeter()
        text = meter.measure(self.model, messages, [], 512)
        structured = meter.measure(self.model, messages, [], 512, json_output=True)
        self.assertEqual(text.output_tokens, 512)
        self.assertEqual(structured.output_tokens, 131072)
        self.assertGreater(structured.input_tokens, text.input_tokens)
        meter.observe(self.model, messages, [], 512, {"prompt_tokens": 20}, json_output=True)
        self.assertEqual(meter.measure(self.model, messages, [], 512, json_output=True).input_tokens, 20)
        self.assertEqual(meter.measure(self.model, messages, [], 512), text)

    def test_output_reservation_can_trigger_compact_below_eighty_percent(self):
        size = ModelWindow(200000).measure([{"role": "user", "content": "x" * 90000}], [],
                                         131072, json_output=True)
        self.assertLess(size.input_tokens, size.window_tokens * .8)
        self.assertTrue(size.needs_compaction)

    def test_json_agent_compaction_is_plain_text_with_separate_output_cap(self):
        settings = replace(self.settings, context_window_tokens=24000, model_max_output_tokens=8192)
        model = ChatModel(settings, self.client)
        entries, captured = history(), []
        def dispatch(**kwargs):
            captured.append(copy.deepcopy(kwargs))
            return response('{"answer":42}' if "response_format" in kwargs else "已查到条件，继续核对。")
        self.client.chat.completions.create.side_effect = dispatch
        agent, ctx = self.json_agent(mode="single"), self.context()
        result = call_model(model, list(entries), [], agent, ctx, Hooks(), Runner(model)._messages,
                            compactor=Compactor(entries))
        self.assertEqual(json.loads(result.text), {"answer": 42})
        self.assertGreaterEqual(len(captured), 2)
        for call in captured[:-1]:
            self.assertNotIn("response_format", call)
            self.assertGreater(call["max_tokens"], 0)
        self.assertEqual(captured[-1]["response_format"], {"type": "json_object"})
        self.assertNotIn("max_tokens", captured[-1])
        self.assertEqual(ctx.state.compactions[-1]["status"], "completed")

    def test_invalid_declared_output_capacity_is_rejected(self):
        for value in (0, -1, True, 1000000):
            with self.subTest(value=value), self.assertRaises(ValueError):
                replace(self.settings, model_max_output_tokens=value)
        with self.assertRaises(ValueError):
            replace(self.settings, chat_supports_json_object="yes")
