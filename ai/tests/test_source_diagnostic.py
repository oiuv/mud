"""Read-only repository diagnostics and audience projection on temporary files."""
import io
import json
from contextlib import redirect_stdout, redirect_stderr
from dataclasses import replace
from types import SimpleNamespace
from unittest.mock import Mock, patch

from ai.scripts import debug_source as cli
from ai.src.npc.presentation import player_text_gaps, present_result
from ai.src.runtime.context import Policy, RunContext
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.runtime.runner import Result, Outcome
from ai.src.source_config import load_sources
from ai.src.source_diagnostic import diagnose_source
from ai.tests.test_npc_ai import Fixture
from ai.tests.test_npc_runtime import completion, reply


class SourceDiagnosticTests(Fixture):
    def setUp(self):
        super().setUp()
        public = self.root / "public"
        public.mkdir()
        (public / "lesson.lpc").write_text(
            'int learn(object who) {\n'
            '    if (who->query("contribution") < 200) return 0;\n'
            '    who->add("contribution", -50);\n'
            '    return 1;\n}\n', encoding="utf-8")
        self.settings.source_root = public
        self.client = Mock()
        self.client.with_options.return_value = self.client

    def script(self, *, technical=False, interim=None):
        calls = [0]
        def respond(**kwargs):
            calls[0] += 1
            if calls[0] == 1:
                return completion(tool="source__read", arguments={"path": "lesson.lpc"})
            if interim is not None:
                return completion(json.dumps(interim, ensure_ascii=False))
            evidence = [item for message in kwargs["messages"] if message["role"] == "tool"
                        for item in json.loads(message["content"]).get("value", {}).get("evidence", [])]
            key = evidence[-1]["id"]
            value = dict(status="completed", kind="rules", pending=[],
                         parts=[dict(text="问学先生说：入门须贡献至少二百，成功只扣五十。" + ("见 lesson.lpc。" if technical else ""),
                                     evidence=[key])],
                         investigation=dict(subject="入门", phase="learn", entry=[key]))
            return completion(json.dumps(value, ensure_ascii=False))
        self.client.chat.completions.create.side_effect = respond

    def test_admin_view_quotes_current_authorized_evidence_without_player_database(self):
        self.script(technical=True)
        report = diagnose_source(self.settings, "入门需要多少贡献，实际扣多少？",
                                 audience="admin", client=self.client)
        self.assertEqual(report["status"], "completed")
        self.assertEqual(report["answer"], report["claims"][0]["text"])
        self.assertEqual(report["evidence"][0]["path"], "lesson.lpc")
        self.assertIn("-50", report["evidence"][0]["content"])
        self.assertEqual(report["evidence"][0]["scope"], "repository")
        self.assertEqual(report["source_access"]["mode"], "repository")
        self.assertEqual(report["source_access"]["policy_version"], "repository-source-v2")
        self.assertEqual(len(report["source_access"]["fingerprint"]), 64)
        self.assertEqual(len(report["evidence"][0]["hash"]), 64)
        self.assertFalse(report["runtime_state_verified"])
        self.assertEqual(report["evidence_basis"], "source_snapshot")
        self.assertFalse(self.settings.data_dir.exists())
        self.assertEqual(report["ledger"]["model_calls"], 2)
        names = {tool["function"]["name"] for tool in self.client.chat.completions.create.call_args.kwargs["tools"]}
        self.assertEqual(names, {"skill", "source__search", "source__read"})
        self.client.close.assert_not_called()  # passed-in client remains caller-owned

    def test_player_projection_keeps_conditions_but_hides_investigation_and_paths(self):
        self.script()
        report = diagnose_source(self.settings, "入门贡献？", client=self.client)
        self.assertEqual(report["status"], "completed")
        self.assertIn("二百", report["answer"])
        self.assertNotIn("evidence", report)
        self.assertNotIn("investigation", report)
        self.assertNotIn("lesson.lpc", json.dumps(report))

    def test_global_disable_precedes_player_and_admin_model_calls(self):
        self.settings.source_enabled = False
        with self.assertRaisesRegex(RuntimeFault, "scope_denied"):
            diagnose_source(self.settings, "隐藏条件？", client=self.client)
        self.client.chat.completions.create.assert_not_called()
        with self.assertRaisesRegex(RuntimeFault, "scope_denied"):
            diagnose_source(self.settings, "条件？", audience="admin", client=self.client)

    def test_egress_and_deployment_restrictions_precede_any_model_call(self):
        self.settings.runtime_policy = {"egress_scopes": []}
        with self.assertRaisesRegex(RuntimeFault, "egress_denied"):
            diagnose_source(self.settings, "条件？", audience="admin", client=self.client)
        self.settings.runtime_policy = {"tools": ["skill"]}
        with self.assertRaisesRegex(RuntimeFault, "scope_denied"):
            diagnose_source(self.settings, "条件？", client=self.client)
        self.client.chat.completions.create.assert_not_called()

    def test_admin_view_uses_snapshot_label_when_revision_unknown(self):
        self.script()
        report = diagnose_source(self.settings, "条件？", audience="admin", client=self.client)
        self.assertEqual(report["evidence"][0]["revision"], "")
        self.assertFalse(report["runtime_state_verified"])

    def test_player_text_detection_preserves_commands_but_rejects_source_details(self):
        context = RunContext("r", "p", "player", "s", Policy(), None)
        context.state.evidence["source:fixture"] = dict(origin="source.read", path="skills/entry.lpc",
                                                       content="int can_learn(object who) { return 1; }")
        for text in ("侠客说：见 skills/entry.lpc", "侠客说：can_learn 决定此事", "侠客说：调用 this_player()",
                     "侠客说：#define REQUIRE 60", "侠客说：见 source:fixture", "侠客说：\x1b[2J请看",
                     "侠客说：源码明载须百级。", "侠客说：源代码中有此限制。"):
            with self.subTest(text=text):
                self.assertEqual(player_text_gaps(text, context), ["unsafe_player_text"])
        for text in ("侠客说：用 learn 请教，须贡献六十，扣三十。", "\x1b[32m侠客说：持剑即可。\x1b[0m"):
            self.assertEqual(player_text_gaps(text, context), [])

    def test_projection_rejects_unsettled_or_privilege_mismatched_outcome(self):
        context = RunContext("r", "p", "player", "s", Policy(), None)
        result = Result("completed", dict(answer="侠客说：请看。"))
        outcome = Outcome(result, context, None)
        with self.assertRaisesRegex(RuntimeFault, "result_not_finalized"):
            present_result(outcome, load_sources(self.settings))
        context.state.terminal = result
        self.assertEqual(present_result(outcome, None), {"status": "completed", "answer": "侠客说：请看。"})
        internal = replace(context, audience="internal")
        with self.assertRaisesRegex(RuntimeFault, "audience_denied"):
            present_result(Outcome(result, internal, None), None)

    def test_cancelled_model_is_not_presented_as_a_success(self):
        hooks = Hooks([Hook("after_model", lambda e: Decision("cancel"), intervention=True)])
        self.script()
        report = diagnose_source(self.settings, "条件？", client=self.client, hooks=hooks)
        self.assertEqual(report["status"], "cancelled")
        self.assertEqual(report["ledger"]["model_calls"], 1)
        self.assertNotIn("source:", report["answer"])

    def test_default_cli_preview_does_not_read_config_or_call_provider(self):
        output = io.StringIO()
        with patch.object(cli, "load_settings") as settings, patch.object(cli, "diagnose_source") as run, redirect_stdout(output):
            self.assertEqual(cli.main(["入门条件？"]), 0)
        settings.assert_not_called()
        run.assert_not_called()
        self.assertFalse(json.loads(output.getvalue())["source_read"])

    def test_keyboard_cancel_closes_owned_client_and_keeps_unknown_consumption(self):
        self.client.chat.completions.create.side_effect = KeyboardInterrupt()
        events = []
        hooks = Hooks([Hook("after_model", lambda e: events.append(dict(e)))])
        with patch("ai.src.source_diagnostic.create_chat_client", return_value=self.client):
            report = diagnose_source(self.settings, "条件？", hooks=hooks)
        self.assertEqual(report["status"], "cancelled")
        self.assertEqual(report["ledger"]["usage_incomplete_reports"], 1)
        self.assertEqual(report["ledger"]["usage_groups"][0]["statuses"], {"cancelled": 1})
        self.assertEqual(events[-1]["status"], "cancelled")
        self.assertIsNone(report["cost"]["estimated_total_cost"])
        self.client.close.assert_called_once()

    def test_admin_projection_rechecks_access_before_revealing_snapshots(self):
        sources = load_sources(self.settings)
        context = RunContext("r", "p", "admin", "s", Policy(scopes={"repository"}, egress_scopes={"repository"}),
                             None, agent_id="npc_dialogue")
        evidence = sources.read(context, {"path": "lesson.lpc"})["evidence"][0]
        context.state.evidence[evidence["id"]] = evidence
        result = Result("completed", dict(answer="问学先生说：需贡献二百。",
                                         claims=[dict(text="门槛200", evidence=[evidence["id"]])]))
        context.state.terminal = result
        # Recheck the shared repository exclusion, not a per-role grant.
        with self.assertRaisesRegex(RuntimeFault, "file_unavailable"):
            scope = sources.scopes["repository"]
            from ai.src.tools.source import Sources
            present_result(Outcome(result, context, None), Sources([replace(scope, exclude=("lesson.lpc",))]))

    def test_existing_report_prevents_resubmission_and_preserves_contents(self):
        report = self.root / "report.json"
        report.write_text("existing", encoding="utf-8")
        with patch.object(cli, "diagnose_source") as run, redirect_stderr(io.StringIO()):
            self.assertEqual(cli.main(["条件？", "--execute", "--report", str(report)]), 1)
        run.assert_not_called()
        self.assertEqual(report.read_text(encoding="utf-8"), "existing")

    def test_cli_failure_is_redacted_and_new_report_is_not_a_paid_retry(self):
        report = self.root / "failure.json"
        with patch.object(cli, "load_settings", return_value=self.settings), \
                patch.object(cli, "diagnose_source", side_effect=ValueError("PRIVATE body")) as run, \
                redirect_stdout(io.StringIO()):
            self.assertEqual(cli.main(["条件？", "--execute", "--report", str(report)]), 1)
        run.assert_called_once()
        self.assertNotIn("PRIVATE", report.read_text(encoding="utf-8"))
        self.assertEqual(json.loads(report.read_text(encoding="utf-8"))["state"], "interrupted")
