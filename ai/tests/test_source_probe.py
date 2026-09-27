"""The live probe uses finite synthetic cases, with no arbitrary call-count cap."""
import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from dataclasses import replace
from pathlib import Path
from unittest.mock import Mock, patch

from ai.scripts import verify_source_agent as probe
from ai.src.settings import Settings
from ai.src.runtime.contracts import RuntimeFault
from ai.tests.test_npc_runtime import completion, reply


class SourceProbeTests(unittest.TestCase):
    def test_model_options_fingerprint_is_canonical_and_hides_private_settings(self):
        settings = Settings(chat_api_key="key-secret", chat_base_url="https://private.invalid/?token=url-secret",
                            chat_extra_body={"enable_thinking": False, "vendor_hint": "body-secret"})
        fingerprint = probe.model_options_fingerprint(settings)
        self.assertRegex(fingerprint, r"^[0-9a-f]{64}$")
        self.assertEqual(fingerprint, probe.model_options_fingerprint(replace(
            settings, chat_api_key="rotated-key", chat_extra_body={"vendor_hint": "body-secret", "enable_thinking": False})))
        for private in ("key-secret", "private.invalid", "url-secret", "body-secret"):
            self.assertNotIn(private, fingerprint)

    def test_model_options_fingerprint_separates_effective_call_settings(self):
        settings = Settings(chat_extra_body={"enable_thinking": False})
        fingerprint = probe.model_options_fingerprint(settings)
        for changes in ({"chat_extra_body": {"enable_thinking": True}},
                        {"chat_extra_body": {"enable_thinking": False, "temperature": 0.2}},
                        {"chat_base_url": "https://other.invalid/v1"},
                        {"chat_timeout": settings.chat_timeout + 1},
                        {"chat_reasoning_history": not settings.chat_reasoning_history},
                        {"chat_supports_tools": not settings.chat_supports_tools}):
            with self.subTest(changes=changes):
                self.assertNotEqual(fingerprint, probe.model_options_fingerprint(replace(settings, **changes)))

    def test_preview_never_loads_credentials_or_runs_models(self):
        output = io.StringIO()
        with patch.object(probe, "load_settings") as load, patch.object(probe, "run_cases") as run, redirect_stdout(output):
            self.assertEqual(probe.main([]), 0)
        load.assert_not_called()
        run.assert_not_called()
        self.assertEqual(json.loads(output.getvalue())["execution"], "goal_driven")

    def client(self):
        client = Mock()
        client.with_options.return_value = client
        return client

    def test_single_case_preview_and_invalid_case(self):
        output = io.StringIO()
        with patch.object(probe, "load_settings") as load, redirect_stdout(output):
            self.assertEqual(probe.main(["--case", "ambiguous_name"]), 0)
        load.assert_not_called()
        plan = json.loads(output.getvalue())
        self.assertEqual(plan["cases"], [{"name": "ambiguous_name"}])
        with self.assertRaises(ValueError):
            probe.selected_cases("missing")

    def test_case_filter_and_removed_hard_caps(self):
        cases = probe.selected_cases("ambiguous_name")
        self.assertEqual(len(cases), 1)
        self.assertNotIn("max_calls", cases[0])
        self.assertTrue(all("max_calls" not in case for case in probe.selected_cases()))

    def test_probe_loads_configured_skill_snapshot_instead_of_workspace_copy(self):
        with tempfile.TemporaryDirectory() as temporary:
            for marker in ("BASELINE_GUIDANCE", "CANDIDATE_GUIDANCE"):
                with self.subTest(snapshot=marker):
                    root = Path(temporary) / marker
                    package = root / "npc-dialogue"
                    package.mkdir(parents=True)
                    metadata = dict(name="npc-dialogue", description="Snapshot fixture", version=marker)
                    (package / "SKILL.md").write_text(
                        "---\n" + json.dumps(metadata) + "\n---\n" + marker, encoding="utf-8")
                    client = self.client()
                    client.chat.completions.create.return_value = completion(reply(
                        "incomplete", answer="知事先生说：此事还须查证。", pending=["未核实规则"]))
                    with patch("ai.src.npc.manager.create_chat_client", return_value=client):
                        report = probe.run_cases(Settings(skills_dir=root), only="ambiguous_name")
                    self.assertEqual(report["cases"][0]["status"], "incomplete")
                    messages = client.chat.completions.create.call_args.kwargs["messages"]
                    self.assertIn(marker, json.dumps(messages))
                    self.assertEqual(client.chat.completions.create.call_count, 1)

    def test_missing_configured_skills_do_not_fall_back_to_workspace_copy(self):
        with tempfile.TemporaryDirectory() as temporary:
            client = self.client()
            with patch("ai.src.npc.manager.create_chat_client", return_value=client):
                report = probe.run_cases(Settings(skills_dir=Path(temporary)), only="ambiguous_name")
            client.chat.completions.create.assert_not_called()
            self.assertNotEqual(report["cases"][0]["status"], "completed")

    def test_index_preparation_reuses_configured_argv_launcher_without_model_authority(self):
        client = self.client()
        client.chat.completions.create.return_value = completion(reply(
            "incomplete", answer="知事先生说：此事还须查证。", pending=["未核实规则"]))
        settings = Settings(codegraph_enabled=True, codegraph_command="C:/Program Files/codegraph.cmd")
        def launch(command, root, arguments, context):
            self.assertEqual(command, (settings.codegraph_command,))
            self.assertTrue(root.is_dir())
            self.assertEqual(context.policy.tools, frozenset())
            self.assertIsNotNone(context.deadline)
            if arguments == ["--version"]:
                return "1.6.0\n"
            self.assertEqual(arguments, ["init", str(root), "--yes"])
            return "indexed"
        with (patch.object(probe, "run_cli", side_effect=launch) as run,
              patch("ai.src.npc.manager.create_chat_client", return_value=client)):
            report = probe.run_cases(settings, only="ambiguous_name")
        self.assertEqual(run.call_count, 2)
        self.assertEqual(report["cases"][0]["codegraph"]["version"], "1.6.0")
        self.assertEqual(client.chat.completions.create.call_count, 1)
        self.assertEqual(settings.codegraph_operations, ("explore",))

    def test_index_preparation_failure_does_not_start_model_or_retry(self):
        with (patch.object(probe, "run_cli", side_effect=RuntimeFault("cli_unavailable")) as run,
              patch("ai.src.npc.manager.create_chat_client") as create):
            with self.assertRaisesRegex(RuntimeFault, "cli_unavailable"):
                probe.run_cases(Settings(codegraph_enabled=True), only="ambiguous_name")
        self.assertEqual(run.call_count, 1)
        create.assert_not_called()

    def test_failed_model_keeps_prior_source_trace(self):
        client = self.client()
        truncated = completion("too long")
        truncated.choices[0].finish_reason = "length"
        client.chat.completions.create.side_effect = [completion(tool="source__read", arguments={
            "path": "qinglan.lpc"}), truncated]
        with patch("ai.src.npc.manager.create_chat_client", return_value=client):
            report = probe.run_cases(Settings(), only="ambiguous_name")
        case = report["cases"][0]
        self.assertEqual(case["code"], "truncated")
        self.assertEqual(case["status"], "failed")
        self.assertEqual(case["evidence"][0]["path"], "qinglan.lpc")
        self.assertEqual(case["tool_trace"][1]["tool"], "source.read")
        self.assertEqual(client.chat.completions.create.call_count, 2)

    def test_interruption_keeps_live_tool_steps_without_waiting_for_runner_return(self):
        client = self.client()
        client.chat.completions.create.side_effect = [completion(tool="source__read", arguments={
            "path": "qinglan.lpc"}), KeyboardInterrupt]
        observed = []
        with patch("ai.src.npc.manager.create_chat_client", return_value=client):
            report = probe.run_cases(Settings(), only="ambiguous_name", on_progress=observed.append)
        self.assertTrue(report["interrupted"])
        steps = [item["progress"] for item in observed if item["progress"]["event"] == "tool_step"]
        source = next(item for item in steps if item["tool"] == "source.read")
        self.assertEqual(source["arguments"], {"path": "qinglan.lpc"})
        self.assertEqual(source["evidence_count"], 1)
        self.assertNotIn("authority", json.dumps(observed))
        self.assertNotIn("int can_learn", json.dumps(observed))
        trace = report["cases"][0]["runs"][0]["tool_trace"]
        self.assertEqual(trace[-1]["arguments"]["path"], "qinglan.lpc")

    def test_explicit_cancellation_stops_before_next_model_and_next_case(self):
        client = self.client()
        client.chat.completions.create.return_value = completion(tool="source__read", arguments={
            "path": "teachers/elder.lpc"})
        cancelled = []
        def observe(item):
            if item["progress"].get("tool") == "source.read":
                cancelled.append(True)
        with patch("ai.src.npc.manager.create_chat_client", return_value=client):
            report = probe.run_cases(Settings(), on_progress=observe, cancel_requested=lambda: bool(cancelled))
        self.assertTrue(report["interrupted"])
        self.assertEqual(len(report["cases"]), 1)
        self.assertEqual(report["cases"][0]["status"], "cancelled")
        self.assertEqual(client.chat.completions.create.call_count, 1)
        self.assertEqual(report["total"]["model_calls"], 1)
        self.assertEqual(report["cases"][0]["runs"][0]["tool_trace"][-1]["tool"], "source.read")
        client.close.assert_called_once()

    def test_all_cases_use_temp_data_and_report_without_raw_prompt_or_code(self):
        client = self.client()
        client.chat.completions.create.return_value = completion(reply(
            "incomplete", answer="知事先生说：此事还须查证。", pending=["未核实规则"]))
        observed = []
        with patch("ai.src.npc.manager.create_chat_client", return_value=client):
            report = probe.run_cases(Settings(), on_case=lambda case, total: observed.append((case, total)))
        encoded = json.dumps(report, ensure_ascii=False)
        self.assertEqual(len(report["cases"]), 3)
        self.assertEqual(report["total"]["model_calls"], 3)
        self.assertEqual(len(observed), 3)
        self.assertTrue(report["human_review_required"])
        self.assertFalse(report["legacy_transport_deadline"])
        self.assertEqual(report["model_options_fingerprint"], probe.model_options_fingerprint(Settings()))
        self.assertIsNone(report["cost"]["cost_per_successful_task"])
        self.assertIsNone(report["cost"]["estimated_total_cost"])
        self.assertNotIn("messages", encoded)
        self.assertNotIn("#define", encoded)
        self.assertFalse(report["cases"][0]["checks"]["expected_status"])
        self.assertTrue(report["cases"][0]["checks"]["model_returned_result"])

    def test_finite_model_can_finish_beyond_old_call_caps_and_shares_usage(self):
        client = self.client()
        count = [0]
        def loop(**kwargs):
            count[0] += 1
            if count[0] > 42:
                raise AssertionError("finite fixture did not finish")
            if count[0] % 14 == 0:
                return completion(reply("incomplete", answer="知事先生说：还须查证。", pending=["尚缺资格条件"]))
            result = completion(tool="source__search", arguments={"query": f"absent-{count[0]}"})
            result.choices[0].message.tool_calls[0].id = f"search-{count[0]}"
            return result
        client.chat.completions.create.side_effect = loop
        with patch("ai.src.npc.manager.create_chat_client", return_value=client):
            report = probe.run_cases(Settings())
        self.assertEqual(client.chat.completions.create.call_count, 42)
        self.assertEqual(report["total"]["model_calls"], 42)
        self.assertEqual(report["total"]["external_calls"], 42)
        self.assertEqual([case["budget"]["model_calls"] for case in report["cases"]], [14, 14, 14])
        self.assertTrue(all(case["status"] == "incomplete" for case in report["cases"]))
        self.assertTrue(all(case["checks"]["model_returned_result"] for case in report["cases"]))
        trace = report["cases"][0]["tool_trace"]
        self.assertEqual(trace[1]["arguments"]["query"], "absent-1")
        self.assertEqual(trace[1]["evidence_count"], 0)
        self.assertNotIn("authority", json.dumps(trace))
