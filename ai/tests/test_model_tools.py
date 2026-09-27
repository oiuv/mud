"""Provider response contract tests, with no network access."""
import time
import unittest
from dataclasses import replace
from types import SimpleNamespace as NS
from unittest.mock import Mock

import httpx
from openai import APIConnectionError, APITimeoutError

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

    def test_explicit_empty_tools_sends_none_for_tool_capable_provider(self):
        self.response(content="final answer", finish="stop")
        complete_model(self.settings, self.client, [], tools=[])
        kwargs = self.client.chat.completions.create.call_args.kwargs
        self.assertEqual(kwargs["tool_choice"], "none")
        self.assertNotIn("tools", kwargs)
        for settings, tools in ((self.settings, None),
                                (replace(self.settings, chat_supports_tools=False), [])):
            complete_model(settings, self.client, [], tools=tools)
            self.assertNotIn("tool_choice", self.client.chat.completions.create.call_args.kwargs)

    def test_unsupported_tools_do_not_call_provider(self):
        with self.assertRaises(ModelUnavailable) as error:
            complete_model(replace(self.settings, chat_supports_tools=False), self.client, [], tools=self.tools)
        self.assertEqual(error.exception.code, "unsupported_tools")
        self.client.with_options.assert_not_called()

    def test_only_classified_context_errors_enable_compact_recovery(self):
        for code, expected in (("context_length_exceeded", "context_window_exceeded"),
                               ("context_window_exceeded", "context_window_exceeded"),
                               ("invalid_request", "api_error")):
            error = RuntimeError("private provider error")
            error.code, error.status_code = code, 400
            self.client.chat.completions.create.side_effect = error
            with self.assertRaises(ModelUnavailable) as caught:
                complete_model(self.settings, self.client, [], tools=[])
            self.assertEqual(caught.exception.code, expected)
            self.assertNotIn("private", str(caught.exception))

    def test_invalid_calls_finish_and_truncation(self):
        cases = [([self.call(id="")], "tool_calls", "invalid_tools"),
                 ([self.call(arguments={})], "tool_calls", "invalid_tools"),
                 ([self.call()], "stop", "invalid_tools"),
                 ([], "tool_calls", "invalid_finish"),
                 ([self.call()], "length", "truncated")]
        for calls, finish, code in cases:
            with self.subTest(code=code):
                self.response(content="private-provider-content", calls=calls, finish=finish)
                with self.assertLogs("ai.src.llm", level="WARNING") as logs:
                    with self.assertRaises(ModelUnavailable) as error:
                        complete_model(self.settings, self.client, [], tools=self.tools)
                self.assertEqual(error.exception.code, code)
                self.assertIn("code=" + code, logs.output[0])
                self.assertNotIn("private-provider-content", logs.output[0])

    def test_connection_and_timeout_are_distinct_safe_recovery_categories(self):
        request = httpx.Request("POST", "https://example.invalid/completions")
        for fault, expected in ((APIConnectionError(request=request), "connection_error"),
                                (APITimeoutError(request=request), "timeout")):
            self.client.chat.completions.create.side_effect = fault
            with self.assertRaises(ModelUnavailable) as caught:
                complete_model(self.settings, self.client, [])
            self.assertEqual(caught.exception.code, expected)
            self.assertNotIn("https", str(caught.exception))

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
