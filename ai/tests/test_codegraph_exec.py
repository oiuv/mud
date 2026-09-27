"""Seven CLI operations through the one model entry; fixtures are not live CLI acceptance."""
import json
import unittest
from dataclasses import replace
from unittest.mock import patch

from ai.src.runtime.context import Policy, RunContext
from ai.src.runtime.tools import Tools
from ai.src.settings import Settings
from ai.src.tools.codegraph import OPERATIONS
from ai.src.tools.exec import build_tools
from ai.tests import test_codegraph


class CodeGraphExecTests(unittest.TestCase):
    setUp = test_codegraph.CodeGraphTests.setUp
    node = test_codegraph.CodeGraphTests.node

    def run_output(self, args, output):
        with patch("ai.src.tools.codegraph.run_cli", return_value=output) as run:
            reply = self.tools.execute("exec", {"program": "codegraph", "args": args},
                                       self.context, "actual-" + str(len(self.context.state.calls)))
            argv = run.call_args.args[2] if run.called else None
        return reply, argv

    def test_seven_commands_map_to_actual_operations_and_current_source(self):
        node = self.node()
        samples = {
            "explore": "**Exploration: gate**\n\n- \x60gate\x60 (gate.lpc:1)\n\n"
                       "**\x60gate.lpc\x60** — gate(function)\n\n\x60\x60\x60c\n1\tint gate() {\n2\tPRIVATE RAW TEXT\n3\t}\n\x60\x60\x60\n",
            "query": json.dumps([{"node": node, "score": 1}]),
            "callers": json.dumps({"symbol": "target", "callers": [node]}),
            "callees": json.dumps({"symbol": "target", "callees": [node]}),
            "impact": json.dumps({"symbol": "target", "affected": [node]}),
            "node": "**gate** (function)\n\n**Location:** gate.lpc:1\n\n\x60\x60\x60c\n1\tint gate() {\n"
                    "2\tPRIVATE RAW TEXT\n3\t}\n\x60\x60\x60\n",
            "files": json.dumps([{"path": "gate.lpc"}, {"path": "data/PRIVATE.lpc"},
                                 {"path": "../PRIVATE.lpc"}, {"path": "missing.lpc"}]),
        }
        for op, output in samples.items():
            with self.subTest(operation=op):
                args = [op] if op == "files" else [op, "gate"]
                reply, argv = self.run_output(args, output)
                self.assertTrue(reply["ok"], reply)
                self.assertEqual(argv[0], op)
                self.assertNotIn("context", argv)
                self.assertEqual(argv[1:3], ["--path", str(self.root)])
                if op != "files":
                    self.assertEqual(argv[-2:], ["--", "gate"])
                    self.assertIn("return 100", reply["value"]["evidence"][0]["content"])
                else:
                    self.assertEqual(reply["value"]["files"], ["gate.lpc"])
                self.assertNotIn("PRIVATE", json.dumps(reply))

    def test_node_excerpt_uses_current_lines_and_checks_indexed_declaration(self):
        output = "**gate** (function)\n\n**Location:** gate.lpc:1\n\n\x60\x60\x60c\n2\tignored CLI text\n\x60\x60\x60\n"
        reply, argv = self.run_output(["node", "gate"], output)
        self.assertEqual(reply["value"]["evidence"][0]["content"], "    return 100;")
        self.assertEqual(argv[0], "node")
        (self.root / "gate.lpc").write_text("// shifted\n// unrelated\n// unrelated\nint gate() {}\n", encoding="utf-8")
        reply, _ = self.run_output(["node", "gate"], output)
        self.assertEqual(reply["value"]["status"], "index_outdated")
        self.assertEqual(reply["value"]["evidence"], [])

    def test_cli_informational_empty_results_are_no_match_not_parse_errors(self):
        samples = {
            "files": "ℹ No files found matching the criteria.\n",
            "query": "[]\n",
            "callers": 'ℹ Symbol "missing" not found\n',
            "callees": 'ℹ Symbol "missing" not found\n',
            "impact": 'ℹ Symbol "missing" not found\n',
        }
        for marker in ("ℹ", "[i]"):
            for operation, output in samples.items():
                with self.subTest(operation=operation, marker=marker):
                    args = [operation] if operation == "files" else [operation, "missing"]
                    reply, _ = self.run_output(args, output.replace("ℹ", marker))
                    self.assertTrue(reply["ok"], reply)
                    self.assertEqual(reply["value"]["status"], "no_match")
                    self.assertEqual(reply["value"]["evidence"], [])
                    self.assertEqual(reply["value"]["symbols"], [])

    def test_malformed_cli_output_is_not_silently_accepted_as_empty(self):
        for operation, output in (
                ("files", "PRIVATE unreadable database"),
                ("query", "ℹ No files found matching the criteria."),
                ("callers", 'ℹ Symbol "PRIVATE" not found\nPRIVATE error'),
                ("impact", '{"affected": null}')):
            with self.subTest(operation=operation, output=output):
                args = [operation] if operation == "files" else [operation, "gate"]
                reply, _ = self.run_output(args, output)
                self.assertFalse(reply["ok"])
                self.assertEqual(reply["error"], "codegraph_invalid_result")
                self.assertNotIn("PRIVATE", json.dumps(reply))

    def test_operations_reject_root_override_and_management_before_launch(self):
        for op in OPERATIONS:
            args = [op] if op == "files" else [op, "gate"]
            reply, argv = self.run_output([*args, "--path", "../PRIVATE"], "ignored")
            self.assertFalse(reply["ok"])
            self.assertIsNone(argv)
        for args in (["index", "."], ["query", "gate", "--limit", "999"],
                     ["node", "../private.lpc"], ["node", "data/private.lpc"],
                     ["node", "gate", "--file", "data/private.lpc"],
                     ["files", "--filter", "../outside"], ["files", "--output", "file"],
                     ["query", "gate", "--json"], ["node", "gate", "--offset", "-1"]):
            reply, argv = self.run_output(args, "ignored")
            self.assertFalse(reply["ok"], args)
            self.assertIsNone(argv)

    def test_query_is_positional_data_even_when_it_looks_like_a_flag(self):
        query = '--path another & %PATH% "中文"'
        reply, argv = self.run_output(["query", query], "[]")
        self.assertTrue(reply["ok"])
        self.assertEqual(argv[-2:], ["--", query])

    def test_legacy_enablement_does_not_grant_new_operations_or_lose_path(self):
        settings = Settings(source_root=self.root, codegraph_enabled=True,
                            codegraph_command="C:/Program Files/codegraph.cmd")
        tools = Tools(build_tools({"sources": self.sources, "settings": settings}))
        ctx = RunContext("migration", "a", "player", "s", self.context.policy, None)
        definitions = tools.definitions(ctx)
        self.assertEqual([d["function"]["name"] for d in definitions], ["exec"])
        description = definitions[0]["function"]["description"]
        self.assertIn("explore", description)
        self.assertNotIn('"callers"', description)
        self.assertNotIn("Program Files", description)
        self.assertFalse(tools.execute("exec", {"program": "codegraph", "args": ["query", "gate"]},
                                       ctx, "new-operation")["ok"])
        self.assertEqual(tools.execute("codegraph.explore", {"query": "gate"},
                                       ctx, "old")["error"], "unknown_tool")
        with patch("ai.src.tools.codegraph.run_cli", return_value="") as run:
            tools.execute("exec", {"program": "codegraph", "args": ["explore", "gate"]}, ctx, "old-operation")
        self.assertEqual(run.call_args.args[0], ("C:/Program Files/codegraph.cmd",))
        disabled = replace(settings, source_enabled=False)
        self.assertEqual(list(build_tools({"sources": self.sources, "settings": disabled})), [])

    def test_catalog_is_filtered_and_discovery_does_not_bypass_source_policy(self):
        denied = RunContext("denied", "a", "player", "s", Policy(tools={"exec"}), None)
        self.assertNotIn('"program":"codegraph"', self.tools.definitions(denied)[0]["function"]["description"])
        with patch("ai.src.tools.codegraph.run_cli") as run:
            reply = self.tools.execute("exec", {"program": "codegraph", "args": ["files"]}, denied, "denied")
            self.assertEqual(reply["error"], "scope_denied")
            run.assert_not_called()
