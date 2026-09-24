"""Linux launcher lifecycle checks; no model calls or dependency downloads."""
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import tempfile
import time
import unittest


LAUNCHER = Path(__file__).resolve().parents[1] / "start.sh"
FAKE_MAIN = """
import os
import signal
import sys
import time

def stop(signum, frame):
    print("STOPPED", flush=True)
    raise SystemExit(0)

signal.signal(signal.SIGTERM, stop)
print("STARTED", os.getcwd(), sys.argv[1:], flush=True)
while True:
    time.sleep(0.1)
"""


@unittest.skipUnless(sys.platform == "linux" and shutil.which("flock"),
                     "Linux and flock required")
class LauncherTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="mud ai launcher ")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        shutil.copy2(LAUNCHER, self.root / "start.sh")
        (self.root / ".venv/bin").mkdir(parents=True)
        (self.root / ".venv/bin/python").symlink_to(sys.executable)
        (self.root / ".env").write_text("# existing settings\n")
        (self.root / "main.py").write_text(FAKE_MAIN)
        (self.root / "scripts").mkdir()
        (self.root / "scripts/update_knowledge.py").write_text(
            "from pathlib import Path\n"
            "with Path(\'updates\').open(\'a\') as output: output.write(\'update\\n\')\n"
        )
        self.env = dict(os.environ, AI_STOP_TIMEOUT="3")
        self.addCleanup(self.command, "stop")

    def command(self, *args, check=False, env=None):
        result = subprocess.run(
            ["bash", str(self.root / "start.sh"), *args],
            cwd="/", env=env or self.env,
            capture_output=True, text=True, timeout=15,
        )
        if check:
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        return result

    def pid(self):
        return int((self.root / ".run/ai.pid").read_text().split()[0])

    def test_lifecycle_and_duplicate_start(self):
        self.command("start", check=True)
        first = self.pid()
        self.command("start", check=True)
        self.assertEqual(self.pid(), first)
        self.command("status", check=True)
        self.assertNotEqual(self.command("run").returncode, 0)
        self.assertNotEqual(self.command("setup").returncode, 0)
        self.command("restart", "-d", check=True)
        self.assertNotEqual(self.pid(), first)
        self.command("stop", check=True)
        self.assertEqual(self.command("status").returncode, 3)
        log = (self.root / "logs/ai.log").read_text()
        self.assertIn(str(self.root), log)
        self.assertIn("['-d']", log)
        self.assertEqual(log.count("STOPPED"), 2)
        self.assertEqual((self.root / "updates").read_text().splitlines(), ["update", "update"])

    def test_stale_pid_does_not_stop_another_process(self):
        outsider = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(60)"])
        self.addCleanup(outsider.wait)
        self.addCleanup(outsider.terminate)
        (self.root / ".run").mkdir()
        (self.root / ".run/ai.pid").write_text(f"{outsider.pid} previous-boot:1\n")
        self.assertEqual(self.command("status").returncode, 3)
        self.command("stop", check=True)
        self.assertIsNone(outsider.poll())
        self.command("start", check=True)
        self.assertNotEqual(self.pid(), outsider.pid)
        self.assertIsNone(outsider.poll())

    def test_local_update_failure_prevents_start(self):
        (self.root / "scripts/update_knowledge.py").write_text("raise SystemExit(1)\n")
        self.assertNotEqual(self.command("start").returncode, 0)
        self.assertFalse((self.root / ".run/ai.pid").exists())

    def test_start_failure_returns_error_and_logs(self):
        (self.root / "main.py").write_text('raise RuntimeError("startup-test-failed")\n')
        result = self.command("start")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("startup-test-failed", result.stderr)
        self.assertEqual(self.command("status").returncode, 3)
        self.assertFalse((self.root / ".run/ai.pid").exists())

    def test_stop_timeout_keeps_process_and_pid(self):
        (self.root / "main.py").write_text(
            "import signal, time\n"
            "signal.signal(signal.SIGTERM, signal.SIG_IGN)\n"
            "while True: time.sleep(0.1)\n"
        )
        self.command("start", check=True)
        pid = self.pid()
        # This PID belongs to our temporary fixture and deliberately ignores TERM.
        self.addCleanup(os.kill, pid, signal.SIGKILL)
        env = dict(self.env, AI_STOP_TIMEOUT="1")
        self.assertNotEqual(self.command("stop", env=env).returncode, 0)
        self.assertEqual(self.pid(), pid)
        self.assertNotEqual(self.command("restart", env=env).returncode, 0)
        self.assertEqual(self.pid(), pid)
        self.command("status", check=True)

    def test_foreground_can_be_stopped_by_another_command(self):
        with (self.root / "foreground.log").open("w") as log:
            process = subprocess.Popen(
                ["bash", str(self.root / "start.sh"), "run", "--debug"],
                cwd="/", env=self.env, stdout=log, stderr=log,
            )
            try:
                deadline = time.monotonic() + 5
                while "STARTED" not in (self.root / "foreground.log").read_text():
                    if process.poll() is not None or time.monotonic() >= deadline:
                        self.fail("Foreground service failed to start")
                    time.sleep(0.05)
                self.assertEqual(self.pid(), process.pid)
                self.command("stop", check=True)
                self.assertEqual(process.wait(timeout=5), 0)
            finally:
                if process.poll() is None:
                    process.kill()
                    process.wait(timeout=5)

    def test_setup_preserves_existing_configuration(self):
        (self.root / "config").mkdir()
        (self.root / "config/npc_roles.json").write_text('{"existing": true}\n')
        (self.root / ".venv/bin/python").unlink()
        # Simulate only pip to keep the setup test offline.
        (self.root / ".venv/bin/python").write_text(
            '#!/usr/bin/env bash\n'
            'if [[ "$1" == -m && "$2" == pip ]]; then exit 0; fi\n'
            f'exec "{sys.executable}" "$@"\n'
        )
        (self.root / ".venv/bin/python").chmod(0o700)
        self.command("setup", env=dict(self.env, AI_PYTHON=sys.executable), check=True)
        self.assertEqual((self.root / ".env").read_text(), "# existing settings\n")
        self.assertEqual((self.root / "config/npc_roles.json").read_text(), '{"existing": true}\n')

    def test_invalid_arguments_and_missing_environment(self):
        self.assertEqual(self.command("unknown").returncode, 2)
        self.assertEqual(self.command("start", "--unknown").returncode, 2)
        (self.root / ".venv/bin/python").unlink()
        self.assertNotEqual(self.command("start").returncode, 0)
        self.assertFalse((self.root / ".run/ai.pid").exists())


if __name__ == "__main__":
    unittest.main()
