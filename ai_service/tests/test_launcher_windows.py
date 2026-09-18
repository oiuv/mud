"""Real Windows launcher lifecycle checks in temporary, offline service copies."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
import unittest
import venv


SERVICE = Path(__file__).resolve().parents[1]
FAKE_MAIN = """
import argparse
from pathlib import Path
import time

parser = argparse.ArgumentParser()
parser.add_argument("--stop-file", type=Path)
parser.add_argument("-d", action="store_true")
args = parser.parse_args()
print("STARTED", Path.cwd(), args.d, flush=True)
while not args.stop_file.exists():
    time.sleep(0.05)
print("STOPPED", flush=True)
"""
FAKE_UPDATE = """
from pathlib import Path
import sys
print("BM25 check complete", file=sys.stderr)
root = Path(__file__).resolve().parents[1]
with (root / "updates").open("a") as output:
    output.write("update\\n")
"""


@unittest.skipUnless(sys.platform == "win32", "Windows launcher required")
class WindowsLauncherTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.template = tempfile.TemporaryDirectory(prefix="mud-win-venv-")
        cls.addClassCleanup(cls.template.cleanup)
        venv.create(Path(cls.template.name).resolve(), with_pip=False)

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="mud ai Windows 中文 ")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        shutil.copytree(self.template.name, self.root / ".venv")
        for name in ("start.ps1", "start.bat"):
            shutil.copy2(SERVICE / name, self.root / name)
        (self.root / "scripts").mkdir()
        shutil.copy2(SERVICE / "scripts/run_service.py", self.root / "scripts/run_service.py")
        (self.root / "scripts/update_knowledge.py").write_text(FAKE_UPDATE, encoding="utf-8")
        (self.root / "main.py").write_text(FAKE_MAIN, encoding="utf-8")
        (self.root / ".env").write_text("# test environment\n", encoding="utf-8")
        (self.root / ".env.example").write_text("# template environment\n", encoding="utf-8")
        (self.root / "requirements.txt").write_text("# offline fixture\n", encoding="utf-8")
        (self.root / "config").mkdir()
        (self.root / "config/npc_roles.example.json").write_text('{"template": true}\n', encoding="utf-8")
        self.env = dict(os.environ, AI_STOP_TIMEOUT="3", PYTHONUTF8="1")
        self.addCleanup(self.command, "stop")

    def command(self, *args, check=False, env=None):
        result = subprocess.run(
            ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass",
             "-File", str(self.root / "start.ps1"), *args],
            cwd=tempfile.gettempdir(), env=env or self.env,
            capture_output=True, encoding="utf-8", errors="replace", timeout=25,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
        if check:
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        return result

    def batch_command(self, *args):
        return subprocess.run(
            [str(self.root / "start.bat"), *args], shell=True,
            cwd=tempfile.gettempdir(), env=self.env, capture_output=True,
            encoding="utf-8", errors="replace", timeout=25,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )

    def prepare_bootstrap(self):
        # Keep a real Windows venv template; simulate creation and pip offline.
        original = (self.root / ".venv").resolve()
        template = (self.root / "bootstrap-template").resolve()
        self.assertEqual(original.parent, self.root)
        self.assertEqual(template.parent, self.root)
        original.rename(template)
        modules = self.root / "bootstrap-modules"
        modules.mkdir()
        (modules / "venv.py").write_text(
            "import shutil, sys\n"
            f"shutil.copytree({str(template)!r}, sys.argv[-1])\n",
            encoding="utf-8",
        )
        (modules / "pip.py").write_text(
            "from pathlib import Path\n"
            "import sys\n"
            "root = Path(__file__).resolve().parents[1]\n"
            "assert sys.argv[1:] == ['install', '-r', str(root / 'requirements.txt')]\n"
            "with (root / 'installs').open('a') as output: output.write('install\\n')\n"
            "if (root / 'fail-install').exists(): raise SystemExit(9)\n",
            encoding="utf-8",
        )
        self.env.update(AI_PYTHON=sys.executable, PYTHONPATH=str(modules))

    def test_default_batch_start_bootstraps_and_preserves_configuration(self):
        self.prepare_bootstrap()
        roles = self.root / "config/npc_roles.json"
        roles.write_text('{"existing": true}\n', encoding="utf-8")
        result = self.batch_command()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.command("status", check=True)
        self.assertEqual((self.root / ".env").read_text(), "# test environment\n")
        self.assertEqual(roles.read_text(), '{"existing": true}\n')
        self.assertEqual((self.root / "installs").read_text().splitlines(), ["install"])
        self.assertEqual((self.root / "updates").read_text().splitlines(), ["update"])
        self.command("stop", check=True)
        self.command("start", check=True)
        self.assertEqual((self.root / "installs").read_text().splitlines(), ["install"])
        self.assertEqual((self.root / "updates").read_text().splitlines(), ["update", "update"])

    def test_default_powershell_start_copies_missing_configuration(self):
        self.prepare_bootstrap()
        (self.root / ".env").unlink()
        self.command(check=True)
        self.assertEqual((self.root / ".env").read_text(), "# template environment\n")
        self.assertEqual((self.root / "config/npc_roles.json").read_text(), '{"template": true}\n')
        self.command("status", check=True)

    def test_failed_install_is_retried_before_knowledge_update(self):
        self.prepare_bootstrap()
        failure = self.root / "fail-install"
        failure.touch()
        result = self.command()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("exit 9", result.stderr)
        self.assertTrue((self.root / ".venv/Scripts/python.exe").is_file())
        self.assertFalse((self.root / "updates").exists())
        self.assertFalse((self.root / ".run/windows-service.json").exists())
        failure.unlink()
        # Existing venv must be enough to retry, even without the base interpreter.
        self.env["AI_PYTHON"] = str(self.root / "unavailable-python.exe")
        self.command(check=True)
        self.assertEqual((self.root / "installs").read_text().splitlines(), ["install", "install"])
        self.assertEqual((self.root / "updates").read_text().splitlines(), ["update"])
        self.command("status", check=True)

    def state(self):
        return json.loads((self.root / ".run/windows-service.json").read_text(encoding="utf-8"))

    def test_lifecycle_updates_once_per_start_and_appends_logs(self):
        self.command("start", check=True)
        first = self.state()["ProcessId"]
        self.command("start", check=True)
        self.assertEqual(self.state()["ProcessId"], first)
        self.command("status", check=True)
        self.assertNotEqual(self.command("setup").returncode, 0)
        self.command("restart", "-d", check=True)
        self.assertNotEqual(self.state()["ProcessId"], first)
        self.command("stop", check=True)
        self.assertEqual(self.command("status").returncode, 3)
        self.assertEqual((self.root / "updates").read_text().splitlines(), ["update", "update"])
        log = (self.root / "logs/ai_service.log").read_text(encoding="utf-8")
        self.assertIn(str(self.root), log)
        self.assertIn("True", log)
        self.assertEqual(log.count("STOPPED"), 2)

    def test_stale_state_never_stops_another_process(self):
        outsider = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(60)"],
                                    creationflags=subprocess.CREATE_NO_WINDOW)
        self.addCleanup(outsider.wait)
        self.addCleanup(outsider.terminate)
        (self.root / ".run").mkdir()
        (self.root / ".run/windows-service.json").write_text(json.dumps({
            "ProcessId": outsider.pid, "StartTicks": "1", "RunId": "a" * 32,
        }), encoding="utf-8")
        self.assertEqual(self.command("status").returncode, 3)
        self.command("stop", check=True)
        self.assertIsNone(outsider.poll())
        self.assertFalse(list((self.root / ".run").glob("stop-*.request")))

    def test_local_update_failure_prevents_start(self):
        (self.root / "scripts/update_knowledge.py").write_text("raise SystemExit(1)\n")
        self.assertNotEqual(self.command("start").returncode, 0)
        self.assertFalse((self.root / ".run/windows-service.json").exists())

    def test_service_failure_is_reported_in_log(self):
        (self.root / "main.py").write_text('raise RuntimeError("startup-test-failed")\n')
        self.assertNotEqual(self.command("start").returncode, 0)
        self.assertEqual(self.command("status").returncode, 3)
        self.assertIn("startup-test-failed",
                      (self.root / "logs/ai_service.log").read_text(encoding="utf-8"))

    def test_foreground_can_be_stopped_by_another_command(self):
        with (self.root / "foreground.log").open("w", encoding="utf-8") as log:
            process = subprocess.Popen(
                ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass",
                 "-File", str(self.root / "start.ps1"), "run", "-d"],
                cwd=tempfile.gettempdir(), env=self.env, stdout=log, stderr=log,
                creationflags=subprocess.CREATE_NO_WINDOW,
            )
            try:
                deadline = time.monotonic() + 12
                while "AI service running" not in (self.root / "foreground.log").read_text(encoding="utf-8"):
                    if process.poll() is not None or time.monotonic() >= deadline:
                        self.fail((self.root / "foreground.log").read_text(encoding="utf-8"))
                    time.sleep(0.1)
                self.command("stop", check=True)
                self.assertEqual(process.wait(timeout=8), 0,
                                 (self.root / "foreground.log").read_text(encoding="utf-8"))
            finally:
                if process.poll() is None:
                    self.command("stop")
                    process.kill()
                    process.wait(timeout=5)

    def test_stop_timeout_keeps_process_and_prevents_restart(self):
        (self.root / "main.py").write_text(
            FAKE_MAIN.replace("while not args.stop_file.exists():",
                              'while not args.stop_file.exists() or not (Path(__file__).parent / "release").exists():'),
            encoding="utf-8",
        )
        self.command("start", check=True)
        first = self.state()["ProcessId"]
        try:
            env = dict(self.env, AI_STOP_TIMEOUT="1")
            self.assertNotEqual(self.command("stop", env=env).returncode, 0)
            self.assertNotEqual(self.command("restart", env=env).returncode, 0)
            self.assertEqual(self.state()["ProcessId"], first)
            self.command("status", check=True)
            self.assertEqual((self.root / "updates").read_text().splitlines(), ["update"])
        finally:
            (self.root / "release").touch()
            self.command("stop", check=True)

    def test_batch_entrypoint_help(self):
        result = subprocess.run(
            [str(self.root / "start.bat"), "help"], shell=True,
            cwd=tempfile.gettempdir(), env=self.env, capture_output=True,
            encoding="utf-8", errors="replace", timeout=10,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Usage:", result.stdout)


if __name__ == "__main__":
    unittest.main()
