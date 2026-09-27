"""Configured CLI execution, using disposable local programs and no models."""
import json
import os
from pathlib import Path
import sys
import tempfile
import threading
import time
import unittest
from unittest.mock import patch

from ai.src.runtime.cli import run_cli
from ai.src.runtime.context import Policy, RunContext
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.runtime.tools import Tools
from ai.src.tools.exec import Commands, Program, build_tools, load_programs
from ai.src.settings import Settings, load_settings


class ExecTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="mud-cli-中文 space-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.command = json.dumps([sys.executable, "-c", "import json,sys; print(json.dumps(sys.argv[1:]))"])
        self.operations = {"query": {"description": "查找一个符号名（不接受路径或选项）", "arguments": {
            "type": "array", "minItems": 1, "maxItems": 1,
            "items": {"type": "string", "pattern": "^[a-z][a-z_]{0,63}$"}}}}

    def context(self):
        return RunContext("test", "player", "player", "session", Policy(tools={"exec"}), None)

    def program(self, name="lookup", **kw):
        return Program(name, self.command, self.root, "测试用查询程序", self.operations, **kw)

    def test_multiple_programs_one_tool_and_no_discovery_authority(self):
        commands = Commands([self.program(), self.program("second")])
        tools = Tools([commands.tool()])
        ctx = self.context()
        definitions = tools.definitions(ctx)
        self.assertEqual([x["function"]["name"] for x in definitions], ["exec"])
        self.assertIn("lookup", definitions[0]["function"]["description"])
        self.assertIn("second", definitions[0]["function"]["description"])
        for name in ("lookup", "second"):
            reply = tools.execute("exec", {"program": name, "args": ["query", "gate"]}, ctx, name)
            self.assertTrue(reply["ok"], reply)
            self.assertEqual(json.loads(reply["value"]["stdout"]), ["query", "gate"])
        denied = RunContext("denied", "p", "player", "s", Policy(), None)
        self.assertEqual(tools.definitions(denied), [])
        self.assertEqual(tools.execute("exec", {"program": "lookup", "args": ["query", "gate"]},
                                       denied, "denied")["error"], "tool_denied")

    def test_program_operation_target_and_shell_arguments_rejected_before_spawn(self):
        tools = Tools([Commands([self.program()]).tool()])
        for n, args in enumerate((
                {"program": "unknown", "args": ["query", "gate"]},
                {"program": "lookup", "args": ["delete", "gate"]},
                {"program": "lookup", "args": ["query", "../private"]},
                {"program": "lookup", "args": ["query", "gate", "--path", "elsewhere"]},
                {"program": "lookup", "args": "query gate & whoami"},
                {"program": "lookup", "args": ["query", "gate\nwhoami"]},
                {"program": "lookup", "args": ["query", "gate"], "cwd": "elsewhere"})):
            with self.subTest(args=args), patch("ai.src.tools.exec.run_cli") as launch:
                self.assertFalse(tools.execute("exec", args, self.context(), str(n))["ok"])
                launch.assert_not_called()

    def test_hooks_deny_or_rewrite_and_revalidate_without_starting(self):
        for decision in (Decision("deny"), Decision("allow", {"arguments": {
                "program": "lookup", "args": ["query", "gate", "--output", "private"]}})):
            hooks = Hooks([Hook("before_tool", lambda event: decision, intervention=True)])
            tools = Tools([Commands([self.program()]).tool()], hooks)
            with patch("ai.src.tools.exec.run_cli") as launch:
                reply = tools.execute("exec", {"program": "lookup", "args": ["query", "gate"]},
                                      self.context(), "hook")
                self.assertFalse(reply["ok"])
                launch.assert_not_called()

    def test_catalog_and_calls_share_extra_program_authorization(self):
        def deny(context):
            raise RuntimeFault("scope_denied")
        tools = Tools([Commands([self.program(), self.program("private", authorize=deny)]).tool()])
        self.assertNotIn("private", tools.definitions(self.context())[0]["function"]["description"])
        with patch("ai.src.tools.exec.run_cli") as launch:
            reply = tools.execute("exec", {"program": "private", "args": ["query", "gate"]},
                                  self.context(), "denied")
            self.assertEqual(reply["error"], "scope_denied")
            launch.assert_not_called()

    def test_config_relative_paths_and_explicit_environment(self):
        config = {"lookup": {"command": self.command, "cwd": "work",
                             "description": "查询", "operations": self.operations}}
        path = self.root / "programs.json"
        path.write_text(json.dumps(config), encoding="utf-8")
        program = load_programs("programs.json", self.root)[0]
        self.assertEqual(program.cwd, self.root / "work")
        with patch.dict(os.environ, {"CLI_PROGRAMS_FILE": str(path)}, clear=True):
            settings = load_settings(self.root / "absent.env")
        self.assertEqual(settings.cli_programs_file, path)
        self.assertEqual(len(list(build_tools({"settings": settings}))), 1)
        self.assertEqual(load_programs("", self.root), [])
        self.assertEqual(list(build_tools({"settings": Settings()})), [])
        config["lookup"]["unknown"] = True
        path.write_text(json.dumps(config), encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "Invalid CLI_PROGRAMS_FILE"):
            load_programs(path, self.root)
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            Commands([self.program(), self.program()])

    def test_config_example_is_valid_and_does_not_allow_extra_options(self):
        service = Path(__file__).resolve().parents[1]
        programs = load_programs("config/cli_programs.example.json", service)
        self.assertEqual(len(programs), 1)
        program = programs[0]
        program.validate(self.context(), ["version"])
        for args in (["status"], ["version", "--output", "somewhere"]):
            with self.assertRaises(RuntimeFault):
                program.validate(self.context(), args)

    def test_errors_and_environment_do_not_expose_service_secrets(self):
        context = self.context().bounded(10)
        with patch.dict(os.environ, {"OPENAI_API_KEY": "SECRET", "CODEGRAPH_NO_DOWNLOAD": "0"}):
            code = "import os,json; print(json.dumps([os.getenv('OPENAI_API_KEY'), os.getenv('CODEGRAPH_NO_DOWNLOAD')]))"
            output = run_cli((sys.executable, "-c", code), self.root, [], context)
        self.assertEqual(json.loads(output), [None, "0"])
        for code, error in (("print('x'*9000)", "cli_result_too_large"),
                            ("import sys; sys.stderr.write('SECRET'); sys.exit(2)", "cli_failed")):
            with self.assertRaisesRegex(RuntimeFault, error):
                run_cli((sys.executable, "-c", code), self.root, [], context, max_bytes=8000)
        with self.assertRaisesRegex(RuntimeFault, "cli_unavailable"):
            run_cli(("nonexistent-mud-test-cli-000",), self.root, [], context)

    def test_cancellation_and_timeout_preserve_outcome(self):
        for cancelled in (False, True):
            ctx = self.context().bounded(5 if cancelled else .25)
            if cancelled:
                timer = threading.Timer(.25, ctx.budget.cancelled.set)
                timer.start()
                self.addCleanup(timer.cancel)
            started = time.monotonic()
            with self.assertRaises(RuntimeFault) as caught:
                run_cli((sys.executable, "-c", "import time; time.sleep(30)"), self.root, [], ctx)
            self.assertEqual(caught.exception.code, "cancelled" if cancelled else "deadline")
            self.assertLess(time.monotonic() - started, 5)

    @unittest.skipUnless(os.name == "nt", "Windows batch launcher")
    def test_windows_batch_roundtrips_arguments_without_shell_expansion(self):
        script = self.root / "argv.py"
        script.write_text("import json,sys; print(json.dumps(sys.argv[1:], ensure_ascii=True))", encoding="utf-8")
        launcher = self.root / "lookup.cmd"
        launcher.write_text(f'@echo off\n@"{sys.executable}" "%~dp0argv.py" %*\n', encoding="utf-8")
        arguments = ["中文 空格", 'a"quoted"b', "", "trailing\\", "%PATH%", "!PATH!",
                     "x & echo INJECTED", "(test)|whoami", "^<>;,?*", '" & echo BAD & "']
        output = run_cli((str(launcher),), self.root, arguments, self.context().bounded(10))
        self.assertEqual(json.loads(output), arguments)
        with patch.dict(os.environ, {"PATH": str(self.root) + os.pathsep + os.environ["PATH"]}):
            output = run_cli(("lookup",), self.root, arguments, self.context().bounded(10))
        self.assertEqual(json.loads(output), arguments)

    @unittest.skipUnless(os.name == "nt", "Windows batch launcher")
    def test_windows_batch_timeout_and_cancel_stop_forwarded_child(self):
        script = self.root / "sleep.py"
        script.write_text("import sys,time\nfrom pathlib import Path\n"
                          "Path(sys.argv[1]).write_text('started')\n"
                          "time.sleep(2)\nPath(sys.argv[2]).write_text('late')\n", encoding="utf-8")
        launcher = self.root / "sleep.cmd"
        launcher.write_text(f'@echo off\n@"{sys.executable}" "%~dp0sleep.py" %*\n', encoding="utf-8")
        for cancelled in (False, True):
            started = self.root / f"started-{cancelled}"
            late = self.root / f"late-{cancelled}"
            ctx = self.context().bounded(5 if cancelled else .7)
            if cancelled:
                timer = threading.Timer(.7, ctx.budget.cancelled.set)
                timer.start()
                self.addCleanup(timer.cancel)
            with self.assertRaises(RuntimeFault) as caught:
                run_cli((str(launcher),), self.root, [str(started), str(late)], ctx)
            self.assertTrue(started.exists(), "the child must actually start before this check")
            self.assertEqual(caught.exception.code, "cancelled" if cancelled else "deadline")
            time.sleep(2.1)
            self.assertFalse(late.exists(), "cancelled launcher must not leave its forwarded child running")


if __name__ == "__main__":
    unittest.main()
