"""Provider thinking stays in the owning model conversation, never business output."""
import copy
import json
import os
import tempfile
import unittest
from dataclasses import replace
from pathlib import Path
from types import SimpleNamespace as NS
from unittest.mock import Mock, patch

from ai.src.llm import ChatModel, ModelResponse, ModelUnavailable, complete_chat, complete_model
from ai.src.runtime.compaction import Compactor, groups
from ai.src.runtime.hooks import Hook, Hooks
from ai.src.runtime.model import call_model
from ai.src.runtime.runner import Runner
from ai.src.runtime.window import model_window
from ai.src.settings import Settings, load_settings
from ai.tests.test_runtime import RuntimeFixture, ScriptedModel, tool_call


MARKER = "开发诊断专用思考：仍需读取定义，不能猜测公式。"


def provider_reply(reasoning=MARKER, content="已核实的回答"):
    return NS(choices=[NS(finish_reason="stop", message=NS(
        content=content, tool_calls=None, reasoning_content=reasoning))],
        usage=NS(prompt_tokens=12, completion_tokens=10, total_tokens=22,
                 completion_tokens_details=NS(reasoning_tokens=8)))


class ReasoningAdapterTests(unittest.TestCase):
    def client(self, response):
        client = Mock()
        client.with_options.return_value = client
        client.chat.completions.create.return_value = response
        return client

    def test_provider_field_is_separate_from_text_logs_and_billing_totals(self):
        client = self.client(provider_reply())
        with self.assertLogs("ai.src.llm", level="INFO") as logs:
            response = complete_model(Settings(), client, [])
        self.assertEqual(response.reasoning_content, MARKER)
        self.assertEqual(response.text, "已核实的回答")
        self.assertNotIn(MARKER, repr(response))
        self.assertNotIn(MARKER, "\n".join(logs.output))
        self.assertEqual(response.usage["completion_tokens"], 10)
        self.assertEqual(response.usage["total_tokens"], 22)
        self.assertEqual(complete_chat(Settings(), client, []), "已核实的回答")

    def test_missing_null_and_empty_reasoning_remain_compatible(self):
        for value in (None, ""):
            reply = provider_reply(value)
            response = complete_model(Settings(), self.client(reply), [])
            self.assertEqual(response.reasoning_content, value)
            self.assertEqual("reasoning_content" in response.assistant_message(), value is not None)
        reply = provider_reply()
        del reply.choices[0].message.reasoning_content
        self.assertIsNone(complete_model(Settings(), self.client(reply), []).reasoning_content)

    def test_invalid_reasoning_is_safe_failure_not_player_text(self):
        for value in ([], {}, 123):
            with self.assertLogs("ai.src.llm", level="WARNING") as logs:
                with self.assertRaises(ModelUnavailable) as caught:
                    complete_model(Settings(), self.client(provider_reply(value)), [])
            self.assertEqual(caught.exception.code, "invalid_reasoning")
            self.assertNotIn("已核实的回答", "\n".join(logs.output))

    def test_history_capability_can_be_disabled_without_changing_thinking_mode(self):
        with tempfile.TemporaryDirectory() as folder:
            env_file = Path(folder) / ".env"
            env_file.write_text("CHAT_REASONING_HISTORY=true\n", encoding="utf-8")
            with patch.dict(os.environ, {"CHAT_REASONING_HISTORY": "false"}, clear=True):
                settings = load_settings(env_file)
            self.assertFalse(settings.chat_reasoning_history)
            self.assertFalse(ChatModel(settings, None).preserve_reasoning)
            self.assertEqual(settings.chat_extra_body, {"enable_thinking": False})
            with patch.dict(os.environ, {"CHAT_REASONING_HISTORY": "invalid"}, clear=True):
                with self.assertRaises(ValueError):
                    load_settings(env_file)
        self.assertTrue(Settings().chat_reasoning_history)
        left = ChatModel(Settings(), None)
        right = ChatModel(Settings(chat_reasoning_history=False), None)
        self.assertNotEqual(left.context_identity, right.context_identity)


class ReasoningRuntimeTests(RuntimeFixture):
    def test_tool_and_rejected_candidate_keep_reasoning_but_result_does_not(self):
        first = replace(tool_call(), reasoning_content=MARKER)
        model = ScriptedModel(first, ModelResponse("未核实", reasoning_content="应补查"),
                              ModelResponse("已核实", reasoning_content="调查完成"))
        events = []
        hooks = Hooks([Hook(event, events.append) for event in ("before_model", "after_model", "run_end")])
        agent = self.agent(verify=lambda result, ctx: () if result.value == "已核实" else ("missing_rule",))
        outcome = Runner(model, [agent], self.tools(), hooks).run("answer", {"goal": "核对条件"}, self.context())
        self.assertEqual(outcome.result.value, "已核实")
        self.assertEqual(outcome.result.status, "completed")
        self.assertEqual(model.inputs[1][1]["reasoning_content"], MARKER)
        self.assertEqual(model.inputs[2][-2]["reasoning_content"], "应补查")
        groups(model.inputs[2])
        self.assertNotIn(MARKER, str(events))
        self.assertNotIn(MARKER, str(outcome.result))
        self.assertEqual(outcome.context.budget.counts["model_calls"], 3)

    def test_model_capability_disables_history_field_not_response_parsing(self):
        model = ScriptedModel(replace(tool_call(), reasoning_content=MARKER), ModelResponse("完成"))
        model.preserve_reasoning = False
        outcome = Runner(model, [self.agent()], self.tools()).run("answer", {"goal": "问题"}, self.context())
        self.assertEqual(outcome.result.status, "completed")
        self.assertNotIn("reasoning_content", model.inputs[1][1])
        self.assertNotIn(MARKER, json.dumps(model.inputs, ensure_ascii=False))

    def test_reasoning_is_measured_and_compacted_with_its_complete_tool_group(self):
        old = replace(tool_call("old"), reasoning_content="older thinking " * 1300).assistant_message()
        recent = replace(tool_call("recent"), reasoning_content=MARKER).assistant_message()
        entries = [{"role": "system", "content": "仅核对授权证据"}, {"role": "user", "content": "核对条件"},
                   old, {"role": "tool", "tool_call_id": "old", "content": '{"ok":true}'},
                   recent, {"role": "tool", "tool_call_id": "recent", "content": '{"ok":true}'}]
        seen = []
        def summarize(messages, **options):
            seen.append(copy.deepcopy(messages))
            return ModelResponse("先前已读入口，继续核对依赖。", reasoning_content="压缩过程内部思考")
        model = ScriptedModel(summarize, ModelResponse("完成"))
        model.context_window_tokens = 24000
        plain = copy.deepcopy(entries)
        plain[2].pop("reasoning_content")
        self.assertFalse(model_window(model).measure(plain, [], 512).needs_compaction)
        self.assertTrue(model_window(model).measure(entries, [], 512).needs_compaction)
        ctx = self.context()
        ctx.state.evidence["rule"] = {"id": "rule", "text": "门槛60，扣30"}
        evidence = copy.deepcopy(ctx.state.evidence)
        result = call_model(model, list(entries), [], self.agent(max_tokens=512), ctx,
                            Hooks(), Runner(model)._messages, compactor=Compactor(entries))
        self.assertEqual(result.text, "完成")
        self.assertEqual(ctx.state.compactions[0]["status"], "completed")
        self.assertEqual(ctx.state.evidence, evidence)
        self.assertIn(recent, entries)
        groups(entries)
        summarized = json.loads(seen[0][1]["content"])["history"]
        self.assertIn(old, summarized)
        self.assertNotIn("older thinking", json.dumps(entries))
        self.assertNotIn("压缩过程内部思考", json.dumps(entries, ensure_ascii=False))
        self.assertEqual(ctx.budget.counts["model_calls"], 2)
