"""Offline regression for model timeouts and server-side chat diagnostics."""
from contextlib import redirect_stderr, redirect_stdout
import io
import os
from types import SimpleNamespace
from unittest.mock import Mock, patch

from openai import APITimeoutError, APIStatusError

from ai.scripts import diagnose_chat
from ai.src.knowledge_qwen import remaining_timeout
from ai.src.npc.manager import ChatUnavailable, NPCManager
from ai.src.settings import Settings, load_settings
from ai.tests.test_npc_ai import Fixture


class ChatTimeoutTests(Fixture):
    def manager(self):
        client = Mock()
        client.with_options.return_value = client
        client.chat.completions.create.return_value = SimpleNamespace(choices=[
            SimpleNamespace(finish_reason="stop", message=SimpleNamespace(content="回答"))
        ])
        manager = NPCManager(settings=self.settings, client=client, knowledge=Mock())
        return manager, client

    def test_existing_env_gets_independent_chat_and_summary_defaults(self):
        env = self.root / ".env"
        env.write_text("API_TIMEOUT=20\nREQUEST_TIMEOUT=80\n", encoding="utf-8")
        with patch.dict(os.environ, {}, clear=True):
            settings = load_settings(env)
        self.assertEqual(settings.api_timeout, 20)
        self.assertEqual(settings.chat_timeout, 60)
        self.assertEqual(settings.summary_timeout, 20)
        with patch.dict(os.environ, {"CHAT_TIMEOUT": "45", "SUMMARY_TIMEOUT": "10"}, clear=True):
            settings = load_settings(env)
        self.assertEqual(settings.chat_timeout, 45)
        self.assertEqual(settings.summary_timeout, 10)
        for kwargs in ({"chat_timeout": 0}, {"chat_timeout": float("nan")},
                       {"summary_timeout": -1}, {"summary_timeout": float("inf")}):
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                Settings(**kwargs)

    def test_slow_answer_uses_chat_limit_but_summary_and_retrieval_keep_short_limit(self):
        manager, client = self.manager()
        clock = [100.0]
        response = client.chat.completions.create.return_value

        def slow_response(**kwargs):
            clock[0] += 35
            return response

        client.chat.completions.create.side_effect = slow_response
        with patch("ai.src.npc.manager.time.monotonic", side_effect=lambda: clock[0]):
            answer = manager._complete([{"role": "user", "content": "问题"}], deadline=180)
            self.assertEqual(answer, "回答")
            client.with_options.assert_called_with(timeout=60)
            self.assertEqual(remaining_timeout(self.settings, 180), 20)
        client.chat.completions.create.side_effect = None
        manager.summarize("", [])
        client.with_options.assert_called_with(timeout=20)

    def test_chat_is_capped_by_remaining_request_budget(self):
        manager, client = self.manager()
        with patch("ai.src.npc.manager.time.monotonic", return_value=100):
            manager._complete([], deadline=107)
        client.with_options.assert_called_once_with(timeout=7)
        client.chat.completions.create.reset_mock()
        with patch("ai.src.npc.manager.time.monotonic", return_value=100):
            with self.assertRaises(ChatUnavailable):
                manager._complete([], deadline=100)
        client.chat.completions.create.assert_not_called()

    def test_response_after_deadline_is_not_accepted(self):
        manager, client = self.manager()
        clock = [100.0]
        response = client.chat.completions.create.return_value

        def late_response(**kwargs):
            clock[0] = 181.0
            return response

        client.chat.completions.create.side_effect = late_response
        with patch("ai.src.npc.manager.time.monotonic", side_effect=lambda: clock[0]):
            with self.assertRaisesRegex(ChatUnavailable, "超时"):
                manager._complete([], deadline=180)

    def test_timeout_log_reports_cause_without_secrets_or_prompt(self):
        manager, client = self.manager()

        class ReadTimeout(TimeoutError):
            pass

        def fail(**kwargs):
            raise APITimeoutError(request=Mock()) from ReadTimeout("secret-token")

        client.chat.completions.create.side_effect = fail
        self.settings.chat_base_url = "https://secret-user:secret-pass@example.test/v1?key=secret-token"
        with self.assertLogs("ai.src.llm", level="WARNING") as logs:
            with self.assertRaisesRegex(ChatUnavailable, "超时"):
                manager._complete([{"role": "user", "content": "private-player-question"}])
        text = "\n".join(logs.output)
        for expected in ("operation=chat", "model=qwen3.7-flash", "host=example.test",
                         "timeout_s=60.00", "error=APITimeoutError", "cause=ReadTimeout"):
            self.assertIn(expected, text)
        self.assertNotIn("secret", text)
        self.assertNotIn("private-player-question", text)

    def test_http_error_log_keeps_status_without_response_body(self):
        manager, client = self.manager()
        response = Mock(status_code=401, headers={}, request=Mock())
        client.chat.completions.create.side_effect = APIStatusError(
            "secret-provider-error", response=response, body={"key": "secret-key"})
        with self.assertLogs("ai.src.llm", level="WARNING") as logs:
            with self.assertRaises(ChatUnavailable):
                manager._complete([])
        self.assertIn("status=401", "\n".join(logs.output))
        self.assertNotIn("secret", "\n".join(logs.output))


class ChatDiagnosticTests(Fixture):
    def test_config_only_does_not_create_client_or_expose_credentials(self):
        self.settings.chat_api_key = "secret-api-key"
        self.settings.chat_base_url = "https://secret-user:secret-pass@example.test/v1?key=secret-query"
        output = io.StringIO()
        with patch.object(diagnose_chat, "load_settings", return_value=self.settings), \
             patch.object(diagnose_chat, "create_chat_client") as create, redirect_stdout(output):
            code = diagnose_chat.main(["--config-only"])
        self.assertEqual(code, 0)
        create.assert_not_called()
        self.assertIn("example.test", output.getvalue())
        self.assertNotIn("secret", output.getvalue())

    def test_diagnostic_calls_shared_chat_path_and_closes_client(self):
        client = Mock()
        output = io.StringIO()
        with patch.object(diagnose_chat, "load_settings", return_value=self.settings), \
             patch.object(diagnose_chat, "create_chat_client", return_value=client), \
             patch.object(diagnose_chat, "complete_chat", return_value="连接正常") as complete, \
             redirect_stdout(output):
            code = diagnose_chat.main(["--timeout", "30", "测试"])
        self.assertEqual(code, 0)
        self.assertEqual(self.settings.chat_timeout, 30)
        self.assertEqual(complete.call_args.args[2], [{"role": "user", "content": "测试"}])
        self.assertIs(complete.call_args.args[1], client)
        self.assertIn("deadline", complete.call_args.kwargs)
        self.assertIn("调用成功", output.getvalue())
        client.close.assert_called_once()

    def test_diagnostic_failure_has_nonzero_exit_and_releases_client(self):
        client = Mock()
        with patch.object(diagnose_chat, "load_settings", return_value=self.settings), \
             patch.object(diagnose_chat, "create_chat_client", return_value=client), \
             patch.object(diagnose_chat, "complete_chat", side_effect=diagnose_chat.ModelUnavailable("timeout")), \
             redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
            code = diagnose_chat.main([])
        self.assertEqual(code, 1)
        client.close.assert_called_once()
