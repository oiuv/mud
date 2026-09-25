"""Provider response contract tests, with no network access."""
import time
import unittest
from dataclasses import replace
from types import SimpleNamespace as NS
from unittest.mock import Mock

from ai.src.llm import ModelUnavailable, complete_chat, complete_model
from ai.src.settings import Settings


class ModelToolTests(unittest.TestCase):
    def setUp(self):
        self.settings = Settings()
        self.client = Mock()
        self.client.with_options.return_value = self.client
        self.tools = [{"type": "function", "function": {"name": "source_read", "parameters": {"type": "object"}}}]

    def response(self, *, content=None, calls=None, finish="tool_calls"):
        self.client.chat.completions.create.return_value = NS(
            choices=[NS(finish_reason=finish, message=NS(content=content, tool_calls=calls))],
            usage=NS(prompt_tokens=10, completion_tokens=3, total_tokens=13))

    def call(self, name="source_read", arguments='{"path":"rules.lpc"}', id="read-1"):
        return NS(id=id, type="function", function=NS(name=name, arguments=arguments))

    def test_structured_tools_and_usage(self):
        self.response(calls=[self.call()])
        usage = Mock()
        result = complete_model(self.settings, self.client, [], tools=self.tools, usage_callback=usage)
        self.assertEqual(result.tool_calls[0].name, "source_read")
        self.assertEqual(result.tool_calls[0].arguments, '{"path":"rules.lpc"}')
        self.assertEqual(result.usage["total_tokens"], 13)
        usage.assert_called_once_with(result.usage)
        self.assertEqual(self.client.chat.completions.create.call_args.kwargs["tools"], self.tools)

    def test_text_wrapper_rejects_tool_request(self):
        self.response(calls=[self.call()])
        with self.assertRaises(ModelUnavailable) as error:
            complete_chat(self.settings, self.client, [])
        self.assertEqual(error.exception.code, "unexpected_tool_calls")

    def test_unsupported_tools_do_not_call_provider(self):
        with self.assertRaises(ModelUnavailable) as error:
            complete_model(replace(self.settings, chat_supports_tools=False), self.client, [], tools=self.tools)
        self.assertEqual(error.exception.code, "unsupported_tools")
        self.client.with_options.assert_not_called()

    def test_invalid_calls_finish_and_truncation(self):
        cases = [([self.call(id="")], "tool_calls", "invalid_tools"),
                 ([self.call(arguments={})], "tool_calls", "invalid_tools"),
                 ([self.call()], "stop", "invalid_tools"),
                 ([], "tool_calls", "invalid_finish"),
                 ([self.call()], "length", "truncated")]
        for calls, finish, code in cases:
            with self.subTest(code=code):
                self.response(calls=calls, finish=finish)
                with self.assertRaises(ModelUnavailable) as error:
                    complete_model(self.settings, self.client, [], tools=self.tools)
                self.assertEqual(error.exception.code, code)

    def test_late_response_still_reports_usage(self):
        self.response(content="answer", finish="stop")
        usage = Mock()
        def late(**kwargs):
            time.sleep(.025)
            return NS(choices=[], usage=NS(total_tokens=7))
        self.client.chat.completions.create.side_effect = late
        with self.assertRaises(ModelUnavailable) as error:
            complete_model(self.settings, self.client, [], timeout=.01, usage_callback=usage)
        self.assertEqual(error.exception.code, "timeout")
        usage.assert_called_once_with({"total_tokens": 7})
