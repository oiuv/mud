"""Scoring mechanics only: simulated reviews are not human acceptance records."""
from copy import deepcopy
from contextlib import redirect_stderr, redirect_stdout
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import Mock, patch

from ai.scripts import eval_source as cli
from ai.scripts.verify_source_agent import run_cases, source_evidence
from ai.src.settings import Settings
from ai.src.npc.investigation import INVESTIGATION
from ai.src.runtime.contracts import Contract
from ai.src.source_evaluation import (GAME_DICTIONARY_SUITE_PATH, GAME_SUITE_PATH,
                                      digest, evidence_gaps, load_suite, probe_cases,
                                      repository_snapshot, review_template, score_report)
from ai.tests.test_npc_runtime import completion, reply


class SourceEvaluationTests(unittest.TestCase):
    def setUp(self):
        self.suite = load_suite()

    def report(self):
        rows = []
        for case in self.suite["cases"]:
            fixture = self.suite["fixtures"][case["fixture"]]
            names = sorted({e["path"] for c in case["criteria"] for e in c["evidence"]})
            evidence = [{"id": f"source:{index}", "scope": "probe_rules", "path": name,
                         "start": 1, "end": len(fixture["files"][name].splitlines()),
                         "hash": hashlib.sha256(fixture["files"][name].encode("utf-8")).hexdigest()}
                        for index, name in enumerate(names)]
            rows.append({"case": case["name"], "status": case["expected"], "evidence": evidence,
                         "claims": [{"evidence": [e["id"] for e in evidence]}], "elapsed_s": 2.0,
                         "budget": {"model_calls": 3}, "compactions": [{"usage": {}}]})
        return {"state": "finished", "suite_digest": digest(self.suite), "synthetic_only": True,
                "cases": rows, "total": {"model_calls": 60, "usage": {"prompt_tokens": 1000}},
                "cost": {"estimated_total_cost": 4.0}}

    def simulated_review(self, report):
        review = review_template(report, self.suite)
        review["reviewer"] = "UNIT TEST ONLY - not a real reviewer"
        for item in review["cases"]:
            item["gold_verified"] = True
            item["criteria"] = dict.fromkeys(item["criteria"], True)
            item["unsupported_claims"] = 0
        return review

    def test_suite_has_twenty_distinct_tasks_with_valid_evidence(self):
        self.assertEqual(len(self.suite["cases"]), 20)
        self.assertEqual(self.suite["review_status"], "synthetic_regression_only")
        self.assertEqual(len(probe_cases(self.suite, "perform_only")), 1)
        with self.assertRaises(ValueError):
            probe_cases(self.suite, "missing-case")
        kinds = {case["expected"] for case in self.suite["cases"]}
        self.assertEqual(kinds, {"completed", "incomplete", "needs_input"})

    def test_default_preview_does_not_load_settings_or_call_models(self):
        output = io.StringIO()
        with (patch.object(cli, "load_settings") as settings, patch.object(cli, "run_cases") as run,
              patch.object(cli, "repository_snapshot") as snapshot):
            with redirect_stdout(output):
                self.assertEqual(cli.main([]), 0)
            settings.assert_not_called()
            run.assert_not_called()
            snapshot.assert_not_called()
        result = json.loads(output.getvalue())
        self.assertEqual(len(result["cases"]), 20)
        self.assertFalse(result["synthetic_only"])
        self.assertIn("kungfu/class/gaibang/hong.c", result["source_files"])

    def test_no_accuracy_or_success_cost_without_human_review(self):
        report = self.report()
        score = score_report(report, self.suite)
        self.assertFalse(score["acceptance_passed"])
        self.assertIsNone(score["accuracy"])
        self.assertIsNone(score["unsupported_claim_rate"])
        self.assertIsNone(score["cost"]["cost_per_successful_task"])
        self.assertIsNone(score["model_configuration"]["model_options_fingerprint"])
        self.assertEqual(score["completion_rate"], 1)
        template = review_template(report, self.suite)
        self.assertEqual(template["reviewer"], "")
        self.assertTrue(all(item["gold_verified"] is None for item in template["cases"]))

    def test_reviewed_score_preserves_usage_latency_and_failed_attempt_costs(self):
        report = self.report()
        review = self.simulated_review(report)
        score = score_report(report, self.suite, review)
        self.assertTrue(score["acceptance_passed"])
        self.assertEqual(score["accuracy"], 1)
        self.assertEqual(score["model_calls"], 60)
        self.assertEqual(score["compactions"], 20)
        self.assertEqual(score["usage"], report["total"])
        self.assertEqual(score["latency_s"], {"total": 40, "mean": 2, "p95": 2})
        self.assertEqual(score["cost"]["cost_per_successful_task"], .2)
        # A failed answer still contributes to total latency, calls and cost.
        review["cases"][0]["criteria"]["elder"] = False
        score = score_report(report, self.suite, review)
        self.assertEqual(score["accuracy"], .95)
        self.assertEqual(score["cost"]["cost_per_successful_task"], 4 / 19)

    def test_refusal_on_answerable_case_never_passes(self):
        report = self.report()
        report["cases"][0]["status"] = "incomplete"
        score = score_report(report, self.suite, self.simulated_review(report))
        self.assertFalse(score["cases"][0]["passed"])
        self.assertEqual(score["accuracy"], .95)
        self.assertEqual(score["completion_rate"], 15 / 16)

    def test_unsupported_claims_and_wrong_conditions_fail_independently(self):
        report = self.report()
        review = self.simulated_review(report)
        review["cases"][0]["unsupported_claims"] = 2
        review["cases"][1]["criteria"]["qualification"] = False
        score = score_report(report, self.suite, review)
        self.assertEqual(score["accuracy"], .9)
        self.assertEqual(score["unsupported_claim_cases"], 1)
        self.assertEqual(score["unsupported_claim_rate"], .05)
        self.assertEqual(score["completion_rate"], 1)

    def test_qualified_inference_scoring_preserves_review_evidence_and_status_gates(self):
        report = self.report()
        row = next(item for item in report["cases"] if item["status"] == "incomplete")
        row["answer"] = "已知此处会检查资格。我推测可能另有考校，但如何判定还未查明，不能作准。"
        # Simulated review labels exercise the score contract, not LLM judgment.
        review = self.simulated_review(report)
        assessment = next(item for item in review["cases"] if item["case"] == row["case"])
        assessment["notes"] = "推测已标明且不违背已知事实；关键缺口与终态保持。"
        score = score_report(report, self.suite, review)
        self.assertTrue(next(item for item in score["cases"] if item["case"] == row["case"])["passed"])
        self.assertIn("冒充事实", review["instructions"])
        self.assertIn("不能只审核带证据段落", review["instructions"])

        row["status"] = "completed"
        score = score_report(report, self.suite, self.simulated_review(report))
        self.assertFalse(next(item for item in score["cases"] if item["case"] == row["case"])["passed"])
        row["status"] = "incomplete"
        row["claims"] = []
        score = score_report(report, self.suite, self.simulated_review(report))
        self.assertTrue(next(item for item in score["cases"] if item["case"] == row["case"])["missing_evidence"])

    def test_inference_label_cannot_override_reviewed_contradiction_or_false_certainty(self):
        for text in ("虽是推测，实际门槛却与已核实的相反。", "只是猜测，不过你一定能通过所有考验。"):
            with self.subTest(text=text):
                report = self.report()
                report["cases"][0]["answer"] = text
                review = self.simulated_review(report)
                review["cases"][0]["criteria"][self.suite["cases"][0]["criteria"][0]["id"]] = False
                review["cases"][0]["unsupported_claims"] = 1
                score = score_report(report, self.suite, review)
                self.assertFalse(score["cases"][0]["passed"])
                self.assertFalse(score["acceptance_passed"])

    def test_minimal_contract_and_valid_references_do_not_certify_semantics(self):
        report = self.report()
        item = report["cases"][0]
        item["investigation"] = Contract(INVESTIGATION).validate(dict(
            subject="所问授艺", phase="learn", entry=[item["evidence"][0]["id"]]))
        case = self.suite["cases"][0]
        self.assertEqual(evidence_gaps(item, case, self.suite["fixtures"][case["fixture"]]), [])
        review = self.simulated_review(report)
        review["cases"][0]["criteria"][case["criteria"][0]["id"]] = False
        score = score_report(report, self.suite, review)
        self.assertFalse(score["cases"][0]["passed"])
        self.assertFalse(score["acceptance_passed"])

    def test_correct_prose_without_current_cited_evidence_fails(self):
        for mutation in ("hash", "range", "citation", "scope"):
            with self.subTest(mutation=mutation):
                report = self.report()
                item = report["cases"][0]
                if mutation == "hash":
                    item["evidence"][0]["hash"] = "0" * 64
                elif mutation == "range":
                    item["evidence"][0]["end"] = 1
                elif mutation == "scope":
                    item["evidence"][0]["scope"] = "elsewhere"
                else:
                    item["claims"] = []
                score = score_report(report, self.suite, self.simulated_review(report))
                self.assertFalse(score["cases"][0]["passed"])
                self.assertTrue(score["cases"][0]["missing_evidence"])

    def test_column_fragment_does_not_count_as_whole_line_or_other_mapping(self):
        fixture = {"files": {"names.py": 'a = "甲"; b = "乙"'}, "exclude": []}
        expected = {"path": "names.py", "start": 1, "end": 1}
        case = {"criteria": [{"id": "name", "evidence": [expected]}]}
        record = dict(expected, id="source:names", scope="repository", start_column=1, end_column=7,
                      origin="source.read",
                      hash=hashlib.sha256(fixture["files"]["names.py"].encode("utf-8")).hexdigest())
        exported = source_evidence({record["id"]: record})[0]
        self.assertEqual((exported["start_column"], exported["end_column"]), (1, 7))
        result = {"evidence": [exported], "claims": [{"evidence": [record["id"]]}]}
        self.assertEqual(evidence_gaps(result, case, fixture), ["name"])
        expected.update(start_column=1, end_column=7)
        self.assertEqual(evidence_gaps(result, case, fixture), [])
        expected.update(start_column=10, end_column=16)
        self.assertEqual(evidence_gaps(result, case, fixture), ["name"])
        del exported["start_column"], exported["end_column"]
        self.assertEqual(evidence_gaps(result, case, fixture), [])

    def test_adjacent_cited_ranges_cover_evidence_without_full_file_read(self):
        report = self.report()["cases"][2]
        original = report["evidence"][0]
        report["evidence"] = [{**original, "end": 3}, {**original, "id": "source:next", "start": 4}]
        report["claims"][0]["evidence"].append("source:next")
        case = self.suite["cases"][2]
        self.assertEqual(evidence_gaps(report, case, self.suite["fixtures"][case["fixture"]]), [])

    def test_subset_missing_review_or_nonboolean_review_cannot_be_acceptance(self):
        report = self.report()
        report["cases"] = report["cases"][:1]
        score = score_report(report, self.suite, self.simulated_review(report))
        self.assertFalse(score["human_review_complete"])
        self.assertIsNone(score["accuracy"])
        self.assertEqual(score["passed_cases"], 1)
        report = self.report()
        review = self.simulated_review(report)
        review["cases"][0]["criteria"]["elder"] = 1
        self.assertFalse(score_report(report, self.suite, review)["human_review_complete"])
        review = self.simulated_review(report)
        review["cases"][0]["gold_verified"] = False
        self.assertFalse(score_report(report, self.suite, review)["human_review_complete"])
        review = self.simulated_review(report)
        review["reviewer"] = None
        self.assertFalse(score_report(report, self.suite, review)["human_review_complete"])
        report["state"] = "interrupted"
        self.assertFalse(score_report(report, self.suite, self.simulated_review(report))["acceptance_passed"])

    def test_changed_report_dataset_and_duplicate_rows_reject_old_reviews(self):
        report = self.report()
        review = self.simulated_review(report)
        report["cases"][0]["status"] = "failed"
        with self.assertRaisesRegex(ValueError, "stale_review"):
            score_report(report, self.suite, review)
        suite = deepcopy(self.suite)
        suite["cases"][0]["question"] += "changed"
        with self.assertRaisesRegex(ValueError, "suite_mismatch"):
            score_report(report, suite)
        report = self.report()
        report["cases"].append(report["cases"][0])
        with self.assertRaisesRegex(ValueError, "invalid_report_cases"):
            score_report(report, self.suite)

    def test_fixed_suite_reuses_business_agent_without_leaking_gold_to_model(self):
        client = Mock()
        client.with_options.return_value = client
        client.chat.completions.create.return_value = completion(reply(
            "incomplete", answer="知事先生说：此事还须查证。", pending=["未核实规则"]))
        with patch("ai.src.npc.manager.create_chat_client", return_value=client):
            report = run_cases(Settings(), cases=probe_cases(self.suite))
        self.assertEqual(len(report["cases"]), 20)
        self.assertEqual(report["total"]["model_calls"], 20)
        messages = json.dumps(client.chat.completions.create.call_args_list[0].kwargs["messages"], ensure_ascii=False)
        self.assertNotIn(self.suite["cases"][0]["criteria"][0]["text"], messages)
        self.assertNotIn("987654", messages)

    def test_existing_output_prevents_provider_call_and_offline_modes_remain_offline(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            run = root / "run.json"
            run.write_text(json.dumps(self.report()), encoding="utf-8")
            with patch.object(cli, "load_settings") as settings, patch.object(cli, "run_cases") as execute:
                with self.assertRaises(FileExistsError):
                    cli.main(["--suite", "synthetic", "--execute", "--report", str(run)])
                with redirect_stdout(io.StringIO()):
                    cli.main(["--suite", "synthetic", "--review-template", str(run), "--report", str(root / "review.json")])
                    cli.main(["--suite", "synthetic", "--score", str(run), "--report", str(root / "score.json")])
                settings.assert_not_called()
                execute.assert_not_called()
                score = json.loads((root / "score.json").read_text(encoding="utf-8"))
                self.assertIsNone(score["accuracy"])

    def test_cancel_keeps_inflight_usage_and_does_not_start_next_case(self):
        client = Mock()
        client.with_options.return_value = client
        client.chat.completions.create.side_effect = KeyboardInterrupt
        with patch("ai.src.npc.manager.create_chat_client", return_value=client):
            report = run_cases(Settings(), cases=probe_cases(self.suite))
        self.assertTrue(report["interrupted"])
        self.assertEqual(len(report["cases"]), 1)
        self.assertEqual(report["cases"][0]["status"], "cancelled")
        self.assertEqual(report["total"]["model_calls"], 1)
        self.assertEqual(report["total"]["usage_unknown"]["prompt_tokens"], 1)
        self.assertIsNone(report["cost"]["estimated_total_cost"])
        client.close.assert_called_once()

    def test_game_manifest_names_real_skills_without_embedding_copied_source(self):
        suite = load_suite(GAME_SUITE_PATH)
        self.assertEqual(suite["kind"], "repository")
        self.assertEqual(len(suite["cases"]), 20)
        self.assertEqual(len(suite["repository_files"]), 16)
        self.assertTrue(all("files" not in item for item in suite["fixtures"].values()))
        self.assertNotIn("青岚", json.dumps(suite, ensure_ascii=False))
        with self.assertRaisesRegex(ValueError, "repository_root_required"):
            probe_cases(suite)

    def test_dictionary_suite_preserves_original_questions_sources_and_missing_dependency(self):
        original, updated = load_suite(GAME_SUITE_PATH), load_suite(GAME_DICTIONARY_SUITE_PATH)
        self.assertNotEqual(digest(original), digest(updated))
        self.assertEqual(len(updated["repository_files"]), 17)
        self.assertEqual({name: updated["repository_files"][name] for name in original["repository_files"]},
                         original["repository_files"])
        self.assertEqual(set(updated["repository_files"]) - set(original["repository_files"]), {"data/e2c_dict.o"})
        self.assertEqual(updated["fixtures"], original["fixtures"])
        self.assertEqual(updated["fixtures"]["without_skill_implementation"]["exclude"], ["feature/skill.c"])
        self.assertEqual(len(updated["cases"]), len(original["cases"]))
        for before, after in zip(original["cases"], updated["cases"]):
            with self.subTest(case=before["name"]):
                self.assertEqual({key: value for key, value in before.items() if key != "criteria"},
                                 {key: value for key, value in after.items() if key != "criteria"})
                self.assertEqual(after["criteria"][:len(before["criteria"])], before["criteria"])
                extra = after["criteria"][len(before["criteria"]):]
                self.assertEqual([item["id"] for item in extra],
                                 ["name_mapping"] if before["name"] == "hubo_threshold" else [])
        criterion = next(item for item in updated["cases"] if item["name"] == "hubo_threshold")["criteria"][-1]
        evidence = criterion["evidence"][0]
        self.assertEqual((evidence["start"], evidence["end"]), (2, 2))
        self.assertEqual(evidence["end_column"] - evidence["start_column"] + 1, len('"count":"阴阳八卦"'))

    def test_dictionary_preview_and_egress_gate_do_not_read_sources_or_credentials(self):
        with (patch.object(cli, "load_settings") as settings, patch.object(cli, "run_cases") as run,
              patch.object(cli, "repository_snapshot") as snapshot):
            output = io.StringIO()
            with redirect_stdout(output):
                self.assertEqual(cli.main(["--suite", "game-dictionary"]), 0)
            preview = json.loads(output.getvalue())
            self.assertFalse(preview["synthetic_only"])
            self.assertEqual(len(preview["source_files"]), 17)
            self.assertIn("data/e2c_dict.o", preview["source_files"])
            self.assertEqual(preview["suite_digest"], digest(load_suite(GAME_DICTIONARY_SUITE_PATH)))
            with redirect_stderr(io.StringIO()), self.assertRaises(SystemExit):
                cli.main(["--suite", "game-dictionary", "--execute"])
            settings.assert_not_called()
            run.assert_not_called()
            snapshot.assert_not_called()

    def test_real_execution_needs_explicit_egress_before_reading_or_loading_credentials(self):
        with (patch.object(cli, "load_settings") as settings, patch.object(cli, "probe_cases") as cases,
              patch.object(cli, "run_cases") as run, redirect_stderr(io.StringIO())):
            with self.assertRaises(SystemExit):
                cli.main(["--execute", "--report", "not-created.json"])
            settings.assert_not_called()
            cases.assert_not_called()
            run.assert_not_called()

    def test_repository_snapshot_whitelist_hash_and_line_count(self):
        content = '// test-only source\nint gate() { return 60; }\n'
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "gate.c").write_text(content, encoding="utf-8", newline="\n")
            (root / ".env").write_text("NOT_AUTHORIZED", encoding="utf-8")
            suite = {"repository_files": {"gate.c": {
                "hash": hashlib.sha256(content.encode("utf-8")).hexdigest(), "lines": 2}}}
            self.assertEqual(repository_snapshot(suite, root), {"gate.c": content})
            suite["repository_files"]["gate.c"]["lines"] = 3
            with self.assertRaisesRegex(ValueError, "source_changed"):
                repository_snapshot(suite, root)
            suite["repository_files"]["gate.c"]["lines"] = 2
            (root / "gate.c").write_text("changed\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "source_changed"):
                repository_snapshot(suite, root)
            suite["repository_files"] = {".env": {"hash": "0" * 64, "lines": 1}}
            with self.assertRaisesRegex(ValueError, "invalid_fixture_path"):
                repository_snapshot(suite, root)

    def test_game_evidence_scoring_uses_manifest_hash_not_synthetic_answers(self):
        suite = load_suite(GAME_SUITE_PATH)
        case = suite["cases"][0]
        evidence = [{"id": f"source:{index}", "scope": "probe_rules", "path": name,
                     "hash": item["hash"], "start": 1, "end": item["lines"]}
                    for index, (name, item) in enumerate(suite["repository_files"].items())]
        report = {"suite_digest": digest(suite), "synthetic_only": False, "state": "finished",
                  "cases": [{"case": case["name"], "status": "completed", "evidence": evidence,
                             "claims": [{"evidence": [item["id"] for item in evidence]}],
                             "elapsed_s": 1.0, "budget": {"model_calls": 1}}]}
        review = review_template(report, suite)
        review["reviewer"] = "UNIT TEST ONLY"
        review["cases"][0].update(gold_verified=True, criteria=dict.fromkeys(
            review["cases"][0]["criteria"], True), unsupported_claims=0)
        score = score_report(report, suite, review)
        self.assertTrue(score["cases"][0]["passed"])
        self.assertFalse(score["acceptance_passed"])
        self.assertEqual(score["scope"], "repository_snapshot_quality_not_live_game_state")
        report["synthetic_only"] = True
        with self.assertRaisesRegex(ValueError, "suite_mismatch"):
            score_report(report, suite)

    def test_pure_clarification_does_not_force_source_search(self):
        suite = load_suite(GAME_SUITE_PATH)
        case = next(item for item in suite["cases"] if item["name"] == "ambiguous_chan")
        self.assertEqual(evidence_gaps({"status": "needs_input"}, case,
                                      suite["fixtures"][case["fixture"]], suite["repository_files"]), [])
        self.assertTrue(all(item["evidence"] or case["expected"] == "needs_input"
                            for case in suite["cases"] for item in case["criteria"]))

    def test_comparison_quality_requires_both_complete_reviews_for_their_own_reports(self):
        from ai.src.source_evaluation import compare_reports
        direct = self.report()
        direct.update(route="direct", model="fixture", max_tokens=512, context_window_tokens=24000,
                      model_options_fingerprint="a" * 64)
        coordinated = {**deepcopy(direct), "route": "coordinated"}
        reviews = [self.simulated_review(report) for report in (direct, coordinated)]
        self.assertTrue(compare_reports(direct, coordinated, self.suite, reviews=reviews)["equal_quality_verified"])
        with self.assertRaisesRegex(ValueError, "stale_review"):
            compare_reports(direct, coordinated, self.suite, reviews=[reviews[0], reviews[0]])
        reviews[1]["cases"][0]["criteria"]["elder"] = False
        self.assertFalse(compare_reports(direct, coordinated, self.suite, reviews=reviews)["equal_quality_verified"])


if __name__ == "__main__":
    unittest.main()
