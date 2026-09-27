"""Opt-in developer traces do not change Agent behavior or public observations."""
import io
import json
import os
import stat
import tempfile
import unittest
from contextlib import redirect_stderr
from pathlib import Path
from types import SimpleNamespace as NS
from unittest.mock import Mock, patch

from ai.src.llm import ChatModel
from ai.src.runtime.hooks import Hook, Hooks
from ai.src.runtime.runner import Runner
from ai.src.settings import SERVICE_DIR, Settings, load_settings
from ai.tests.test_reasoning import MARKER, provider_reply
from ai.tests.test_runtime import RuntimeFixture


class ReasoningTraceTests(RuntimeFixture):
    def run_response(self, settings, replies=None, *, payload=None, fault=None):
        client = Mock()
        client.with_options.return_value = client
        client.chat.completions.create.side_effect = fault or (replies or [provider_reply()])
        events = []
        hooks = Hooks([Hook(event, events.append) for event in ("before_model", "after_model", "run_end")])
        model = ChatModel(settings, client)
        outcome = Runner(model, [self.agent()], self.tools(), hooks).run(
            "answer", payload or {"goal": "核对条件"}, self.context())
        return outcome, client, events

    def test_disabled_trace_never_writes_or_prints_thinking(self):
        with patch("ai.src.llm.write_trace") as write, redirect_stderr(io.StringIO()) as output:
            outcome, client, events = self.run_response(Settings())
        self.assertEqual(outcome.result.status, "completed")
        write.assert_not_called()
        self.assertNotIn(MARKER, output.getvalue())
        self.assertNotIn(MARKER, str(events))
        self.assertEqual(client.chat.completions.create.call_count, 1)

    def test_file_trace_correlates_calls_without_changing_messages_or_usage(self):
        first = provider_reply(content=None)
        first.choices[0].finish_reason = "tool_calls"
        first.choices[0].message.tool_calls = [NS(id="read", type="function", function=NS(
            name="lookup", arguments='{"q":"entry"}'))]
        second = provider_reply(reasoning="已核对工具结果。")
        baseline, baseline_client, _ = self.run_response(Settings(), [first, second])
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "reasoning.jsonl"
            outcome, client, events = self.run_response(Settings(reasoning_trace_file=target), [first, second])
            rows = [json.loads(line) for line in target.read_text(encoding="utf-8").splitlines()]
            self.assertEqual(len(rows), 2)
            self.assertEqual(rows[0]["reasoning_content"], MARKER)
            self.assertEqual(rows[0]["tool_calls"][0]["id"], "read")
            self.assertEqual(rows[1]["text"], outcome.result.value)
            self.assertEqual(rows[0]["run_id"], rows[1]["run_id"])
            self.assertEqual([row["call_id"] for row in rows], [e["call_id"] for e in events if e["event"] == "after_model"])
            self.assertRegex(rows[0]["model_options_fingerprint"], r"^[a-f0-9]{64}$")
            self.assertNotIn("messages", rows[0])
            self.assertNotIn(MARKER, str(events))
            if os.name == "posix":
                self.assertEqual(stat.S_IMODE(target.stat().st_mode), 0o600)
        self.assertEqual(outcome.result, baseline.result)
        self.assertEqual(outcome.context.budget.usage, baseline.context.budget.usage)
        self.assertEqual(client.chat.completions.create.call_count, 2)
        self.assertEqual([c.kwargs["messages"] for c in client.chat.completions.create.call_args_list],
                         [c.kwargs["messages"] for c in baseline_client.chat.completions.create.call_args_list])

    def test_console_is_explicit_and_known_keys_are_redacted(self):
        secret = 'private-key-"with-quotes"'
        settings = Settings(reasoning_trace_console=True, chat_api_key=secret)
        with redirect_stderr(io.StringIO()) as output:
            outcome, _, events = self.run_response(settings, [provider_reply(MARKER + secret)])
        record = json.loads(output.getvalue())
        self.assertIn(MARKER, record["reasoning_content"])
        self.assertNotIn(secret, record["reasoning_content"])
        self.assertIn("[REDACTED]", record["reasoning_content"])
        self.assertNotIn(MARKER, str(events))
        self.assertNotIn(MARKER, str(outcome.result))

    def test_no_reasoning_is_marked_unavailable_without_synthesizing_it(self):
        with redirect_stderr(io.StringIO()) as output:
            outcome, client, _ = self.run_response(Settings(reasoning_trace_console=True), [provider_reply(None)])
        row = json.loads(output.getvalue())
        self.assertFalse(row["reasoning_available"])
        self.assertIsNone(row["reasoning_content"])
        self.assertEqual(outcome.result.status, "completed")
        self.assertEqual(client.chat.completions.create.call_count, 1)

    def test_failed_writer_does_not_fail_or_replay_business(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "missing-parent" / "reasoning.jsonl"
            with self.assertLogs("ai.src.reasoning_trace", level="WARNING") as logs:
                outcome, client, _ = self.run_response(Settings(reasoning_trace_file=target))
            self.assertFalse(target.exists())
            self.assertEqual(outcome.result.status, "completed")
            self.assertEqual(client.chat.completions.create.call_count, 1)
            self.assertNotIn(MARKER, str(logs.output))
            self.assertNotIn(str(target), str(logs.output))

    def test_player_payload_cannot_enable_trace_or_choose_path(self):
        with tempfile.TemporaryDirectory() as folder, patch("ai.src.llm.write_trace") as write:
            target = Path(folder) / "forged.jsonl"
            outcome, client, _ = self.run_response(Settings(), payload={
                "goal": "问题", "reasoning_trace_file": str(target), "reasoning_trace_console": True})
            self.assertEqual(outcome.result.code, "contract_violation")
            client.chat.completions.create.assert_not_called()
            write.assert_not_called()
            self.assertFalse(target.exists())

    def test_sdk_error_body_is_not_a_reasoning_trace(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "reasoning.jsonl"
            with self.assertLogs("ai.src.llm", level="WARNING") as logs:
                outcome, client, _ = self.run_response(Settings(reasoning_trace_file=target),
                                                       fault=RuntimeError(MARKER))
            self.assertEqual(outcome.result.status, "failed")
            self.assertFalse(target.exists())
            self.assertNotIn(MARKER, str(logs.output))
            self.assertEqual(client.chat.completions.create.call_count, 1)

    def test_environment_controls_destinations_without_changing_provider_options(self):
        with tempfile.TemporaryDirectory() as folder:
            env_file = Path(folder) / ".env"
            env_file.write_text("REASONING_TRACE_CONSOLE=false\n", encoding="utf-8")
            with patch.dict(os.environ, {"REASONING_TRACE_FILE": "logs/reasoning.jsonl",
                                        "REASONING_TRACE_CONSOLE": "true"}, clear=True):
                settings = load_settings(env_file)
            self.assertEqual(settings.reasoning_trace_file, SERVICE_DIR / "logs/reasoning.jsonl")
            self.assertTrue(settings.reasoning_trace_console)
            self.assertTrue(settings.chat_reasoning_history)
            self.assertEqual(settings.chat_extra_body, {"enable_thinking": False})
            with patch.dict(os.environ, {"REASONING_TRACE_FILE": ""}, clear=True):
                self.assertIsNone(load_settings(env_file).reasoning_trace_file)
            with patch.dict(os.environ, {"REASONING_TRACE_CONSOLE": "invalid"}, clear=True):
                with self.assertRaises(ValueError):
                    load_settings(env_file)

    @unittest.skipUnless(os.name == "posix", "POSIX permissions and no-follow trace open")
    def test_insecure_existing_file_or_symlink_is_not_written(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "reasoning.jsonl"
            target.write_text("existing\n", encoding="utf-8")
            target.chmod(0o644)
            link = Path(folder) / "linked.jsonl"
            link.symlink_to(target)
            for path in (target, link):
                with self.subTest(path=path.name), self.assertLogs("ai.src.reasoning_trace", level="WARNING"):
                    outcome, client, _ = self.run_response(Settings(reasoning_trace_file=path))
                self.assertEqual(outcome.result.status, "completed")
                self.assertEqual(client.chat.completions.create.call_count, 1)
                self.assertEqual(target.read_text(encoding="utf-8"), "existing\n")
