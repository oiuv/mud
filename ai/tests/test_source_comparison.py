"""Real direct/coordinator adapters with fake SDKs; no quality claims or network."""
import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from copy import deepcopy
from pathlib import Path
from unittest.mock import Mock, patch

from ai.scripts import eval_source as cli
from ai.scripts import verify_source_agent as probe_cli
from ai.scripts.verify_source_agent import delivery_projection, run_cases, run_records
from ai.src.settings import Settings
from ai.src.source_evaluation import compare_reports, digest, load_suite, evidence_gaps
from ai.tests.test_npc_runtime import completion, reply


CASE = dict(name="gate", expected="completed", question="临时武学的学习门槛是多少？",
            files={"gate.lpc": '// CHILD_ONLY_REFERENCE\nint gate() { return 60; }\n',
                   "other.lpc": '// UNREFERENCED_MATERIAL\nint extra() { return 99; }\n'},
            criteria=["核对当前入口后说明门槛六十。"], required_files=["gate.lpc"], exclude=[])


class SourceComparisonTests(unittest.TestCase):
    def execute(self, route="coordinated", *, combined=False, final="completed", invalid_delivery=False):
        client = Mock()
        client.with_options.return_value = client
        self.inputs = []
        counts = {"main": 0, "npc": 0}

        def generate(**kwargs):
            messages = kwargs["messages"]
            main = any("按技能协调目标" in message.get("content", "") for message in messages
                       if message["role"] == "system")
            self.inputs.append((main, deepcopy(messages)))
            role = "main" if main else "npc"
            counts[role] += 1
            step = counts[role]
            if main:
                if step == 1:
                    return completion(tool="agent__invoke", arguments={
                        "name": "npc_dialogue", "input": {"message": CASE["question"]}})
                if step not in ((2, 3) if invalid_delivery else (2,)):
                    raise AssertionError("Unexpected coordinator retry")
                if final == "cancelled":
                    raise KeyboardInterrupt
                if final == "failed":
                    response = completion("unfinished")
                    response.choices[0].finish_reason = "length"
                    return response
                handoff = next(json.loads(item["content"])["value"] for item in reversed(messages)
                               if item["role"] == "tool" and
                               "result_ref" in json.loads(item["content"]).get("value", {}))
                value = json.loads(reply(kind="rules", answer="须备六十。" if combined else ""))
                if combined:
                    # The returned conclusions must already carry references the
                    # parent can use, not private child source IDs.
                    value["parts"] = [dict(text="须备六十。", evidence=handoff["conclusions"][0]["evidence"])]
                else:
                    value["result_ref"] = handoff["result_ref"]
                    if invalid_delivery and step == 2:
                        value["parts"] = handoff["conclusions"]
                return completion(json.dumps(value, ensure_ascii=False))
            if step == 1:
                return completion(tool="skill", arguments={"name": "source-investigation"})
            if step in (2, 3):
                response = completion(tool="source__read", arguments={
                    "path": "gate.lpc" if step == 2 else "other.lpc"})
                response.choices[0].message.tool_calls[0].id = "read-" + str(step)
                return response
            if step != 4:
                raise AssertionError("Unexpected professional retry")
            records = [record for message in messages if message["role"] == "tool"
                       for record in json.loads(message["content"]).get("value", {}).get("evidence", [])]
            reference = next(item["id"] for item in records if item["path"] == "gate.lpc")
            value = json.loads(reply(kind="rules", answer="知事先生说：须备六十。", evidence=[reference]))
            value["investigation"] = dict(subject="临时武学", phase="learn", entry=[reference])
            return completion(json.dumps(value, ensure_ascii=False))

        client.chat.completions.create.side_effect = generate
        self.progress = []
        with patch("ai.src.npc.manager.create_chat_client", return_value=client):
            report = run_cases(Settings(), cases=[CASE], route=route, on_progress=self.progress.append)
        client.close.assert_called_once()
        return report

    def test_original_delivery_preserves_evidence_without_parent_raw_material(self):
        report = self.execute()
        case = report["cases"][0]
        self.assertEqual(report["source_access"], {
            "mode": "pinned_snapshot", "policy_version": "repository-source-v2"})
        self.assertEqual(report["retrieval"], "literal")
        self.assertIsNone(case["codegraph"])
        self.assertEqual(case["status"], "completed", case)
        self.assertEqual(case["response"]["answer"], "知事先生说：须备六十。")
        self.assertEqual(case["delegation_count"], 1)
        self.assertEqual(report["total"]["model_calls"], 6)
        self.assertEqual(report["total"]["usage"]["prompt_tokens"], 60)
        self.assertEqual(sum(len(run["calls"]) for run in case["runs"]), 6)
        self.assertEqual({run["agent"] for run in case["runs"]}, {"main_router", "npc_dialogue"})
        self.assertTrue(all(run["context_peak_tokens_estimated"] > 0 for run in case["runs"]))
        self.assertTrue(all(call["context_window_tokens"] == 1000000
                            for run in case["runs"] for call in run["calls"]))
        self.assertEqual({item["path"] for item in case["evidence"]}, {"gate.lpc"})
        self.assertTrue(all(key.startswith("result:") for claim in case["claims"] for key in claim["evidence"]))
        self.assertEqual(len(case["delivered_artifacts"]), 1)
        self.assertEqual(evidence_gaps(case, {"criteria": [{"id": "gate", "evidence": [
            {"path": "gate.lpc", "start": 1, "end": 2}]}]}, CASE), [])
        self.assertEqual({item["role"] for item in report["total"]["usage_groups"]}, {"primary", "child"})
        parent_messages = json.dumps([messages for main, messages in self.inputs if main])
        self.assertNotIn("CHILD_ONLY_REFERENCE", parent_messages)
        self.assertNotIn("UNREFERENCED_MATERIAL", parent_messages)
        self.assertNotIn("CHILD_ONLY_REFERENCE", json.dumps(report))
        self.assertNotIn(CASE["criteria"][0], json.dumps(self.inputs, ensure_ascii=False))
        self.assertEqual(sum(row["progress"]["event"] == "after_model" for row in self.progress), 6)
        self.assertEqual(self.progress[-1]["total"]["model_calls"], 6)
        self.assertNotIn("messages", json.dumps(self.progress))
        self.assertNotIn("CHILD_ONLY_REFERENCE", json.dumps(self.progress))

    def test_combined_parent_claim_only_expands_cited_committed_artifact(self):
        case = self.execute(combined=True)["cases"][0]
        self.assertEqual(case["status"], "completed", case)
        self.assertEqual(case["claims"][0]["text"], "须备六十。")
        self.assertEqual({item["path"] for item in case["evidence"]}, {"gate.lpc"})
        self.assertNotEqual(case["claims"], case["candidate_claims"])
        self.assertEqual(case["response"]["answer"], "须备六十。")

    def test_direct_route_has_no_coordinator_or_duplicate_cost(self):
        report = self.execute(route="direct")
        case = report["cases"][0]
        self.assertEqual(case["status"], "completed")
        self.assertEqual(report["total"]["model_calls"], 4)
        self.assertEqual(case["delegation_count"], 0)
        self.assertEqual([run["agent"] for run in case["runs"]], ["npc_dialogue"])
        self.assertFalse(any(main for main, _ in self.inputs))

    def test_completion_gap_is_observable_before_recovery_without_raw_result(self):
        report = self.execute(invalid_delivery=True)
        self.assertEqual(report["cases"][0]["status"], "completed")
        rejected = [row for row in self.progress if row["progress"].get("event") == "completion_check"]
        self.assertEqual(len(rejected), 1)
        self.assertEqual(rejected[0]["progress"]["gaps"], ["delivery_requires_empty_parts"])
        self.assertEqual(rejected[0]["total"]["model_calls"], 6)
        self.assertEqual(report["total"]["model_calls"], 7)
        self.assertEqual(report["total"]["delegations"], 1)
        self.assertNotIn("CHILD_ONLY_REFERENCE", json.dumps(rejected))
        self.assertNotIn("claims", rejected[0]["progress"])
        main = next(run for run in report["cases"][0]["runs"] if run["agent"] == "main_router")
        self.assertEqual(main["completion_checks"], [{"status": "rejected",
                                                    "gaps": ["delivery_requires_empty_parts"]}])

    def test_child_success_is_not_final_success_or_final_citation(self):
        for final in ("failed", "cancelled"):
            with self.subTest(final=final):
                report = self.execute(final=final)
                case = report["cases"][0]
                self.assertEqual(case["status"], final)
                self.assertFalse(case["checks"]["expected_status"])
                self.assertEqual(case["evidence"], [])
                self.assertEqual(case["claims"], [])
                self.assertEqual(report["total"]["model_calls"], 6)
                if final == "cancelled":
                    self.assertGreater(report["total"]["usage_unknown"]["prompt_tokens"], 0)
                else:
                    self.assertEqual(report["total"]["usage"]["prompt_tokens"], 60)
                self.assertTrue(any(run["agent"] == "npc_dialogue" and run["status"] == "completed"
                                    for run in case["runs"]))

    def test_simple_main_request_does_not_force_delegation(self):
        client = Mock()
        client.with_options.return_value = client
        client.chat.completions.create.return_value = completion(reply("needs_input", answer="少侠所问是哪门武学？"))
        with patch("ai.src.npc.manager.create_chat_client", return_value=client):
            report = run_cases(Settings(), only="ambiguous_name", route="coordinated")
        self.assertEqual(report["total"]["model_calls"], 1)
        self.assertEqual(report["total"]["delegations"], 0)
        self.assertEqual(report["cases"][0]["status"], "needs_input")
        with self.assertRaisesRegex(ValueError, "unknown_route"):
            run_cases(Settings(), route="wrong")

    def test_unselected_or_unknown_artifact_never_adopts_child_evidence(self):
        artifact = {"value": {"claims": []}, "evidence": {"read": {
            "id": "read", "origin": "source.read", "path": "gate.lpc"}}, "source": "npc_dialogue"}
        projected = delivery_projection({"claims": [{"text": "猜测", "evidence": ["unknown"]}]}, {}, {"unused": artifact})
        self.assertEqual(projected["evidence"], [])
        self.assertEqual(projected["delivered_artifacts"], [])

    def test_run_observation_separates_compact_windows_unknown_usage_and_unexecuted_calls(self):
        identity = dict(run_id="leaf", root_id="root", parent_id="main", agent="npc_dialogue")
        rows = run_records([
            dict(identity, event="after_model", operation="chat", executed=True, status="completed",
                 model="leaf-model", context_tokens_estimated=19000, context_window_tokens=24000,
                 reserved_output_tokens=512, usage={"prompt_tokens": 8000}, usage_known=False),
            dict(identity, event="after_model", operation="compact", executed=True, status="completed",
                 model="leaf-model", context_tokens_estimated=18000, context_window_tokens=24000,
                 reserved_output_tokens=2000, usage={"prompt_tokens": 7000, "completion_tokens": 100}, usage_known=True),
            dict(identity, event="after_model", operation="chat", executed=False, status="failed",
                 context_tokens_estimated=30000),
            dict(identity, event="run_end", status="failed", code="context_limit")], [])
        self.assertEqual(rows[0]["context_peak_tokens_estimated"], 19000)
        self.assertEqual(rows[0]["calls"][1]["operation"], "compact")
        self.assertEqual(rows[0]["calls"][0]["usage"], {"prompt_tokens": 8000})
        self.assertFalse(rows[0]["calls"][2]["executed"])
        self.assertEqual(rows[0]["code"], "context_limit")

    def paired_reports(self):
        suite = load_suite()
        case = suite["cases"][0]
        report = dict(state="finished", route="direct", suite_digest=digest(suite), synthetic_only=True,
                      model="fixture-model", max_tokens=2048, context_window_tokens=1000000,
                      model_options_fingerprint="a" * 64,
                      cases=[dict(case=case["name"], status="incomplete", elapsed_s=1,
                                  budget={"model_calls": 2, "usage": {"prompt_tokens": 20}})])
        return suite, report, {**deepcopy(report), "route": "coordinated"}

    def test_comparison_rejects_different_conditions_and_never_invents_quality(self):
        suite, direct, coordinated = self.paired_reports()
        comparison = compare_reports(direct, coordinated, suite)
        self.assertFalse(comparison["equal_quality_verified"])
        self.assertIsNone(comparison["variants"]["direct"]["accuracy"])
        self.assertIsNone(comparison["variants"]["coordinated"]["cost"]["cost_per_successful_task"])
        for key, value, error in (("route", "direct", "route_mismatch"), ("model", "other", "model_mismatch"),
                                  ("context_window_tokens", None, "model_mismatch"), ("cases", [], "cases_mismatch")):
            with self.subTest(key=key), self.assertRaisesRegex(ValueError, error):
                compare_reports(direct, {**coordinated, key: value}, suite)

    def test_comparison_requires_matching_model_options_on_both_reports(self):
        suite, direct, coordinated = self.paired_reports()
        with self.assertRaisesRegex(ValueError, "comparison_model_mismatch"):
            compare_reports(direct, {**coordinated, "model_options_fingerprint": "b" * 64}, suite)
        for missing in (None, "", "not-a-fingerprint", 123):
            with self.subTest(missing=missing), self.assertRaisesRegex(ValueError, "comparison_model_mismatch"):
                compare_reports({**direct, "model_options_fingerprint": missing},
                                {**coordinated, "model_options_fingerprint": missing}, suite)

    def test_comparison_does_not_mix_historical_pinned_and_repository_access(self):
        suite, direct, coordinated = self.paired_reports()
        access = {"mode": "pinned_snapshot", "policy_version": "repository-source-v2"}
        direct["source_access"] = access
        for other in (None, {**access, "mode": "repository"}, {**access, "policy_version": "other"}):
            with self.subTest(other=other), self.assertRaisesRegex(ValueError, "source_access_mismatch"):
                compare_reports(direct, {**coordinated, "source_access": other}, suite)
        comparison = compare_reports(direct, {**coordinated, "source_access": access}, suite)
        self.assertEqual(comparison["variants"]["direct"]["source_access"], access)

    def test_coordinated_preview_and_offline_comparison_never_load_provider(self):
        suite, direct, coordinated = self.paired_reports()
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            paths = [root / "direct.json", root / "coordinated.json"]
            for path, report in zip(paths, (direct, coordinated)):
                path.write_text(json.dumps(report), encoding="utf-8")
            with (patch.object(cli, "load_settings") as settings, patch.object(cli, "run_cases") as run,
                  redirect_stdout(io.StringIO()) as output):
                self.assertEqual(cli.main(["--route", "coordinated"]), 0)
                self.assertEqual(json.loads(output.getvalue())["route"], "coordinated")
                self.assertEqual(cli.main(["--suite", "synthetic", "--compare", *map(str, paths),
                                           "--report", str(root / "comparison.json")]), 0)
                settings.assert_not_called()
                run.assert_not_called()
            self.assertFalse(json.loads((root / "comparison.json").read_text(encoding="utf-8"))["equal_quality_verified"])

    def test_both_clis_persist_safe_progress_before_case_completion_and_on_failure(self):
        event = {"case": "gate", "progress": {"agent": "main_router", "code": "truncated", "status": "failed"},
                 "total": {"model_calls": 3}}
        for module, options in ((cli, ["--suite", "synthetic"]), (probe_cli, ["--case", "multiple_files"])):
            with self.subTest(module=module.__name__), tempfile.TemporaryDirectory() as temporary:
                report_path = Path(temporary) / "report.json"
                def interrupted(settings, **kwargs):
                    self.assertFalse(kwargs["cancel_requested"]())
                    kwargs["on_progress"](event)
                    second = {**event, "progress": {"event": "completion_check", "gaps": ["missing_evidence"]}}
                    kwargs["on_progress"](second)
                    saved = json.loads(report_path.read_text(encoding="utf-8"))
                    self.assertEqual(saved["inflight"], second)
                    self.assertEqual(saved["source_access"]["mode"], "pinned_snapshot")
                    self.assertEqual(saved["cases"], [])
                    journal = Path(str(report_path) + ".events.jsonl")
                    self.assertEqual([json.loads(line) for line in journal.read_text(encoding="utf-8").splitlines()],
                                     [event, second])
                    Path(str(report_path) + ".cancel").touch()
                    self.assertTrue(kwargs["cancel_requested"]())
                    raise RuntimeError("test failure")
                with (patch.object(module, "load_settings", return_value=Settings(chat_api_key="unit-test")),
                      patch.object(module, "run_cases", side_effect=interrupted), redirect_stdout(io.StringIO())):
                    self.assertEqual(module.main([*options, "--execute", "--route", "coordinated",
                                                  "--report", str(report_path)]), 1)
                saved = json.loads(report_path.read_text(encoding="utf-8"))
                self.assertEqual(saved["state"], "interrupted")
                self.assertEqual(saved["inflight"]["progress"]["gaps"], ["missing_evidence"])
                self.assertNotIn("cost", saved)


if __name__ == "__main__":
    unittest.main()
