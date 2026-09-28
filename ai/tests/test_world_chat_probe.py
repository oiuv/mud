"""Concurrent probe regression: real local UDP, fake models, temporary data only."""
import io
import json
import tempfile
import threading
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

from ai.scripts import verify_world_chat as probe
from ai.src.llm import ModelResponse, ModelUnavailable
from ai.src.settings import Settings


class WorldChatProbeTests(unittest.TestCase):
    def test_preview_does_not_load_configuration_or_execute(self):
        output = io.StringIO()
        with patch.object(probe, "load_settings") as settings, patch.object(probe, "run_case") as run, \
                redirect_stdout(output):
            self.assertEqual(probe.main([]), 0)
        settings.assert_not_called()
        run.assert_not_called()
        self.assertEqual(json.loads(output.getvalue())["model_calls"], 0)

    def test_overlap_requires_two_actual_intervals(self):
        self.assertEqual(probe.overlap_seconds([]), 0)
        calls = [dict(kind="world", started=1, ended=4), dict(kind="npc", started=2, ended=3)]
        self.assertEqual(probe.overlap_seconds(calls), 1)
        calls[1].update(started=4, ended=5)
        self.assertEqual(probe.overlap_seconds(calls), 0)

    def test_failed_call_keeps_returned_usage_and_forwards_accounting(self):
        calls, received = [], []
        adapter = probe.ObservedModel(Settings(), None, "world", calls, threading.Event())
        usage = {"prompt_tokens": 10, "completion_tokens": 1, "total_tokens": 11}
        def fail(adapter, messages, **options):
            options["usage_callback"](usage)
            raise ModelUnavailable("api_error", status_code=429, retry_after=60)
        with patch.object(probe.ChatModel, "__call__", fail):
            with self.assertRaises(ModelUnavailable):
                adapter([], usage_callback=received.append)
        self.assertEqual(received, [usage])
        self.assertEqual(calls[0]["usage"], usage)
        self.assertEqual(calls[0]["status_code"], 429)
        self.assertIn("ended", calls[0])

    def test_real_udp_thread_separation_yield_and_replay(self):
        with tempfile.TemporaryDirectory() as temporary:
            roles = Path(temporary) / "roles.json"
            roles.write_text(json.dumps({"zhou butong": {"name": "周不通", "role": "玩家导师"}}), encoding="utf-8")
            settings = Settings(roles_file=roles, chat_api_key="test")
            npc_entered, yield_checked = threading.Event(), threading.Event()
            calls = []
            tick_keys = []
            original_tick = probe.WorldService._tick

            def tick(service, allowed_keys):
                tick_keys.append(allowed_keys)
                busy = service.chat_busy()
                result = original_tick(service, allowed_keys)
                if busy:
                    yield_checked.set()
                return result

            def model(adapter, messages, **options):
                self.assertFalse(adapter.settings.source_enabled)
                self.assertEqual(adapter.settings.dashscope_api_key, "")
                self.assertIsNone(adapter.settings.reasoning_trace_file)
                self.assertNotEqual(adapter.settings.data_dir, settings.data_dir)
                if options["operation"] == "world_describe":
                    self.assertTrue(npc_entered.wait(5))
                    result = dict(schema_version=1, description="松风拂过山岗，岩隙间松针轻颤。", used_fact_ids=[])
                else:
                    npc_entered.set()
                    self.assertTrue(yield_checked.wait(5))
                    result = dict(status="completed", kind="conversation", pending=[],
                                  parts=[dict(text="周不通说：少侠有礼，且听老周说段往事。")])
                return ModelResponse(text=json.dumps(result, ensure_ascii=False),
                                     usage={"prompt_tokens": 100, "completion_tokens": 30, "total_tokens": 130})

            with patch.object(probe.ChatModel, "__call__", model), \
                    patch.object(probe.WorldService, "_tick", tick):
                report = probe.run_case(settings, run_id="offline-probe", calls=calls)
            self.assertTrue(report["passed"], report)
            self.assertTrue(report["yielded_to_chat"])
            self.assertEqual(report["waiting"], {"state": "queued", "attempts": 0})
            self.assertEqual(report["replay_model_calls"], 0)
            self.assertEqual(len(calls), 2)
            self.assertEqual(len(tick_keys), 2)
            self.assertEqual(len(tick_keys[0]), 1)
            self.assertEqual(tick_keys[0], tick_keys[1])
            self.assertNotEqual(calls[0]["thread"], calls[1]["thread"])
            self.assertFalse(report["provider_429_observed"])

    def test_existing_report_refused_before_model_call(self):
        with tempfile.TemporaryDirectory() as temporary:
            report = Path(temporary) / "report.json"
            report.write_text("original", encoding="utf-8")
            with patch.object(probe, "load_settings", return_value=Settings(chat_api_key="test")), \
                    patch.object(probe, "run_case") as run:
                with self.assertRaises(FileExistsError):
                    probe.main(["--execute", "--report", str(report)])
                run.assert_not_called()
            self.assertEqual(report.read_text(), "original")

    def test_failure_retains_attempts_without_replay_or_private_error(self):
        with tempfile.TemporaryDirectory() as temporary:
            report = Path(temporary) / "report.json"
            def fail(settings, *, run_id, calls):
                calls.append(dict(kind="world", status="failed", started=1, ended=2))
                raise RuntimeError("private-provider-message")
            with patch.object(probe, "load_settings", return_value=Settings(chat_api_key="test")), \
                    patch.object(probe, "run_case", side_effect=fail) as run, redirect_stdout(io.StringIO()):
                self.assertEqual(probe.main(["--execute", "--report", str(report)]), 1)
                self.assertEqual(run.call_count, 1)
            content = json.loads(report.read_text(encoding="utf-8"))
            self.assertEqual(len(content["calls"]), 1)
            self.assertNotIn("private-provider", str(content))


if __name__ == "__main__":
    unittest.main()
