"""CodeGraph integration boundaries; fake CLI output, no model or real index."""
import json
import os
import sys
import tempfile
import threading
import time
import unittest
from dataclasses import replace
from pathlib import Path
from unittest.mock import patch

from ai.src.runtime.context import Policy, RunContext
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.runtime.progress import source_facts
from ai.src.runtime.tools import Tools
from ai.src.settings import Settings, load_settings
from ai.src.tools.codegraph import CodeGraph, OPERATIONS, command_prefix, query_cli
from ai.src.tools.exec import build_tools
from ai.src.tools.source import Scope, Sources, build_tools as source_tools


class CodeGraphTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="ai-graph-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / ".codegraph").mkdir()
        (self.root / ".codegraph/codegraph.db").write_bytes(b"fake index")
        (self.root / "gate.lpc").write_text("int gate() {\n    return 100;\n}\n", encoding="utf-8")
        self.sources = Sources((Scope("repository", self.root),))
        self.settings = Settings(source_root=self.root, codegraph_enabled=True, codegraph_operations=tuple(OPERATIONS))
        self.context = RunContext("r", "a", "admin", "s", Policy(
            tools={"exec", "source.read", "source.search"},
            scopes={"repository"}, egress_scopes={"repository"}), None)
        self.tools = Tools((*build_tools({"sources": self.sources, "settings": self.settings}),
                            *source_tools({"sources": self.sources})))

    def node(self, path="gate.lpc", name="gate", identity="gate", start=1, end=3):
        return dict(id=identity, kind="function", name=name, filePath=path, startLine=start, endLine=end)

    def query(self, nodes=None, edges=(), **arguments):
        raw = dict(nodes=[self.node()] if nodes is None else nodes, edges=list(edges),
                   summary="PRIVATE SUMMARY", relatedFiles=["PRIVATE"], stats={"private": 9876})
        arguments.pop("limit", None)  # All query responses are bounded to eight symbols.
        with patch("ai.src.tools.codegraph.run_cli", return_value="output"), \
                patch("ai.src.tools.codegraph.parse_output", return_value=raw):
            return self.tools.execute("exec", {"program": "codegraph", "args": ["query", "gate"], **arguments}, self.context,
                                      "query-" + str(len(self.context.state.calls)))

    def test_same_call_reads_current_source_and_records_reusable_evidence(self):
        reply = self.query()
        self.assertTrue(reply["ok"], reply)
        value = reply["value"]
        self.assertEqual(value["status"], "matched")
        evidence = value["evidence"][0]
        self.assertEqual(evidence["origin"], "source.read")
        self.assertIn("return 100", evidence["content"])
        self.assertEqual(self.context.state.evidence[evidence["id"]], evidence)
        self.assertEqual(value["symbols"][0]["evidence"], evidence["id"])
        self.assertNotIn("PRIVATE", json.dumps(value))
        self.assertEqual(source_facts("exec", reply), source_facts("source.read", reply))
        changed = self.root / "gate.lpc"
        changed.write_text("int gate() { return 200; }", encoding="utf-8")
        reread = self.tools.execute("source.read", {"path": "gate.lpc", "expected_hash": evidence["hash"]},
                                    self.context, "verify")
        self.assertEqual(reread["error"], "source_changed")

    def test_private_nodes_relations_and_unsafe_paths_do_not_escape(self):
        nodes = [self.node()]
        for n, path in enumerate(("data/private.lpc", ".env", "../private.lpc", "C:/private.lpc",
                                   "hidden/secret.lpc", "gate.lpc:stream")):
            nodes.append(self.node(path, "PRIVATE", "private" + str(n)))
        edges = [dict(source="gate", target=n["id"], kind="calls") for n in nodes[1:]]
        reply = self.query(nodes, edges)
        self.assertTrue(reply["ok"])
        self.assertEqual(len(reply["value"]["symbols"]), 1)
        self.assertEqual(reply["value"]["relations"], [])
        self.assertNotIn("private", json.dumps(reply).lower())

    def test_valid_relationships_and_ambiguous_names_are_only_hints(self):
        (self.root / "other.lpc").write_text("int gate() { return 200; }", encoding="utf-8")
        reply = self.query([self.node(), self.node("other.lpc", identity="other", end=1)],
                           [dict(source="gate", target="other", kind="calls")])
        value = reply["value"]
        self.assertEqual({n["path"] for n in value["symbols"]}, {"gate.lpc", "other.lpc"})
        self.assertEqual(len(value["relations"]), 1)
        self.assertEqual(len(value["evidence"]), 2)
        self.assertTrue(all(e["origin"] == "source.read" for e in value["evidence"]))

    def test_stale_start_is_not_labelled_as_target_symbol(self):
        (self.root / "gate.lpc").write_text("// lines moved\n// unrelated\n// unrelated\nint gate() { return 200; }\n",
                                             encoding="utf-8")
        reply = self.query()
        self.assertEqual(reply["value"]["status"], "index_outdated")
        self.assertEqual(reply["value"]["symbols"], [])
        self.assertEqual(reply["value"]["evidence"], [])

    def test_missing_index_and_no_match_are_distinct_and_search_still_works(self):
        self.assertEqual(self.query([])["value"]["status"], "no_match")
        (self.root / ".codegraph/codegraph.db").unlink()
        self.assertEqual(self.query()["error"], "codegraph_index_missing")
        reply = self.tools.execute("source.search", {"query": "return"}, self.context, "fallback")
        self.assertTrue(reply["ok"])
        self.assertEqual(reply["value"]["evidence"][0]["path"], "gate.lpc")

    def test_disabled_source_or_graph_does_not_register_tool(self):
        for sources, settings in ((Sources(), self.settings),
                                  (self.sources, replace(self.settings, codegraph_enabled=False))):
            self.assertEqual(list(build_tools({"sources": sources, "settings": settings})), [])

    def test_denied_tool_and_egress_do_not_run_cli(self):
        for field in ("tools", "egress_scopes", "scopes"):
            context = replace(self.context, policy=replace(self.context.policy, **{field: set()}))
            with patch("ai.src.tools.codegraph.run_cli") as cli:
                reply = self.tools.execute("exec", {"program": "codegraph", "args": ["query", "gate"]}, context, field)
                self.assertFalse(reply["ok"])
                cli.assert_not_called()

    def test_extra_command_root_or_path_parameters_are_rejected(self):
        for key in ("command", "root", "path", "args", "action"):
            self.assertEqual(self.query(**{key: "PRIVATE"})["error"], "contract_violation")

    def test_hook_rewrite_and_cancellation_do_not_bypass_parameters(self):
        self.tools.hooks = Hooks([Hook("before_tool", lambda event: Decision("allow", {"arguments": {
            "query": "gate", "command": "PRIVATE"}}), intervention=True)])
        with patch("ai.src.tools.codegraph.run_cli") as cli:
            self.assertEqual(self.query()["error"], "contract_violation")
            cli.assert_not_called()
        self.context.budget.cancelled.set()
        with self.assertRaises(RuntimeFault) as caught:
            self.query()
        self.assertEqual(caught.exception.code, "cancelled")

    def test_hook_denial_prevents_external_call(self):
        self.tools.hooks = Hooks([Hook("before_tool", lambda event: Decision("deny"), intervention=True)])
        with patch("ai.src.tools.codegraph.run_cli") as cli:
            reply = self.query()
            self.assertFalse(reply["ok"])
            cli.assert_not_called()

    def test_output_is_bounded_without_silent_json_cutoff(self):
        nodes = []
        for n in range(8):
            path = f"large{n}.lpc"
            (self.root / path).write_text("int gate() {\n" + "// 中文资料" * 900 + "\n}\n", encoding="utf-8")
            nodes.append(self.node(path, identity=str(n)))
        result = self.query(nodes, limit=8)
        self.assertTrue(result["ok"], result)
        self.assertTrue(result["value"]["truncated"])
        self.assertLess(len(json.dumps(result, ensure_ascii=False).encode("utf-8")), 32768)

    def test_linked_source_and_index_are_not_followed(self):
        with tempfile.TemporaryDirectory(prefix="ai-graph-outside-") as temp:
            outside = Path(temp)
            (outside / "private.lpc").write_text("int PRIVATE() { return 1; }", encoding="utf-8")
            try:
                (self.root / "linked.lpc").symlink_to(outside / "private.lpc")
            except OSError:
                self.skipTest("OS does not permit symlink creation")
            reply = self.query([self.node("linked.lpc", "PRIVATE", end=1)])
            self.assertEqual(reply["value"]["evidence"], [])
            self.assertNotIn("PRIVATE", json.dumps(reply))
            (self.root / ".codegraph/codegraph.db").unlink()
            (self.root / ".codegraph/codegraph.db").symlink_to(outside / "private.lpc")
            self.assertEqual(self.query()["error"], "codegraph_index_missing")


class CodeGraphProcessTests(unittest.TestCase):
    def context(self):
        return RunContext("p", "a", "admin", "s", Policy(), None).bounded(5)

    def run_fake(self, code, context=None):
        with tempfile.TemporaryDirectory(prefix="ai-graph-cli-") as root:
            return query_cli((sys.executable, "-c", code), Path(root), "--help; ignored", context or self.context())

    def test_fixed_argv_no_shell_and_no_secret_environment(self):
        code = ("import json,sys,os; print(json.dumps({'nodes': [], 'edges': [], "
                "'args':sys.argv[1:], 'secret':os.getenv('OPENAI_API_KEY')}))")
        with patch.dict(os.environ, {"OPENAI_API_KEY": "PRIVATE"}):
            result = self.run_fake(code)
        self.assertEqual(result["args"][-2:], ["--", "--help; ignored"])
        self.assertIn("--no-code", result["args"])
        self.assertIsNone(result["secret"])

    def test_invalid_json_failure_and_output_cap_are_safe(self):
        for code, expected in (("print('PRIVATE')", "codegraph_invalid_result"),
                               ("import sys; sys.stderr.write('PRIVATE'); sys.exit(3)", "codegraph_unavailable"),
                               ("print('x'*300000)", "codegraph_result_too_large")):
            with self.subTest(expected=expected), self.assertRaises(RuntimeFault) as caught:
                self.run_fake(code)
            self.assertEqual(caught.exception.code, expected)

    def test_tool_owns_cache_maintenance_and_keeps_admin_configuration(self):
        code = ("import json,os; from pathlib import Path; "
                "cache=Path('.codegraph'); cache.mkdir(exist_ok=True); "
                "(cache/'self-maintained').write_text('updated'); "
                "print(json.dumps({'nodes': [], 'edges': [], "
                "'maintained':(cache/'self-maintained').read_text(), "
                "'no_download':os.getenv('CODEGRAPH_NO_DOWNLOAD')}))")
        with patch.dict(os.environ, {key: value for key, value in os.environ.items()
                                    if key.upper() != "CODEGRAPH_NO_DOWNLOAD"}, clear=True):
            result = self.run_fake(code)
            self.assertIsNone(result["no_download"])
            self.assertEqual(result["maintained"], "updated")
            with patch.dict(os.environ, {"CODEGRAPH_NO_DOWNLOAD": "0"}):
                self.assertEqual(self.run_fake(code)["no_download"], "0")

    def test_cancel_and_timeout_terminate_process_without_late_result(self):
        for cancel in (False, True):
            context = self.context()
            if cancel:
                timer = threading.Timer(.2, context.budget.cancelled.set)
                timer.start()
                self.addCleanup(timer.cancel)
            else:
                context = context.bounded(.2)
            started = time.monotonic()
            with self.assertRaises(RuntimeFault) as caught:
                self.run_fake("import time; time.sleep(30)", context)
            self.assertEqual(caught.exception.code, "cancelled" if cancel else "deadline")
            self.assertLess(time.monotonic() - started, 3)

    def test_config_parsing_and_missing_cli(self):
        self.assertEqual(command_prefix("codegraph"), ("codegraph",))
        self.assertEqual(command_prefix('["node", "cg.js"]'), ("node", "cg.js"))
        for value in ("", "[]", "[1]", "[bad", None):
            with self.subTest(value=value), self.assertRaises(ValueError):
                command_prefix(value)
        with self.assertRaisesRegex(RuntimeFault, "codegraph_unavailable"):
            query_cli(("missing-codegraph-executable-000",), Path.cwd(), "gate", self.context())
        with patch.dict(os.environ, {"CODEGRAPH_ENABLED": "true", "CODEGRAPH_COMMAND": '["node","cg.js"]'}, clear=True):
            settings = load_settings(Path(tempfile.gettempdir()) / "nonexistent-graph-test.env")
        self.assertTrue(settings.codegraph_enabled)
        self.assertEqual(command_prefix(settings.codegraph_command), ("node", "cg.js"))
