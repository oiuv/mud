"""Real Docker lifecycle tests, isolated from the game and player data.

RUN_DOCKER_TESTS=1 python -m unittest discover -s tools/tests -p test_docker_launcher.py -v
Requires a running Docker engine and the busybox:latest image (no implicit pull).
"""
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time
import unittest
import uuid

ROOT = Path(__file__).resolve().parents[2]
BASH = str(Path(os.environ.get("MSYS2_ROOT", "C:/msys64")) / "usr/bin/bash.exe") if os.name == "nt" else shutil.which("bash")
FLAGS = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0


@unittest.skipUnless(os.environ.get("RUN_DOCKER_TESTS") == "1", "Set RUN_DOCKER_TESTS=1 to run Docker tests")
class DockerLauncherTests(unittest.TestCase):
    @classmethod
    def docker(cls, *args, check=True):
        return subprocess.run(["docker", *args], capture_output=True, encoding="utf-8",
                              errors="replace", timeout=45, check=check, creationflags=FLAGS)

    @classmethod
    def setUpClass(cls):
        cls.docker("info")
        cls.docker("image", "inspect", "busybox:latest")
        base = ROOT / "temp"
        base.mkdir(exist_ok=True)
        cls.temporary = tempfile.TemporaryDirectory(prefix="docker scripts-", dir=base)
        cls.addClassCleanup(cls.temporary.cleanup)
        cls.base = Path(cls.temporary.name).resolve()
        cls.image = "mud-launcher-test:" + uuid.uuid4().hex[:12]
        (cls.base / "Dockerfile").write_text(
            'FROM busybox:latest\nCOPY driver.sh /driver.sh\n'
            'HEALTHCHECK --interval=1s --timeout=1s --start-period=2s --retries=1 CMD test -f /ready\n'
            'ENTRYPOINT ["/bin/sh", "/driver.sh"]\n',
            encoding="utf-8", newline="\n")
        (cls.base / "driver.sh").write_text(
            '#!/bin/sh\ntrap "exit 0" TERM INT\n'
            'if [ -f /opt/mud/data/fail-start ]; then echo "fixture startup failed"; exit 1; fi\n'
            'if [ ! -f /opt/mud/data/never-ready ]; then touch /ready; fi\n'
            'echo "fixture ready 中文"\nwhile :; do sleep 1; done\n',
            encoding="utf-8", newline="\n")
        cls.docker("build", "--pull=false", "-t", cls.image, str(cls.base))
        cls.addClassCleanup(cls.docker, "image", "rm", cls.image, check=False)

    def setUp(self):
        self.names = []
        self.addCleanup(self.cleanup_containers)

    def cleanup_containers(self):
        # Names are unique test-owned containers; never stop the user's game.
        for name in self.names:
            self.docker("container", "rm", "--force", name, check=False)

    def project(self):
        root = Path(tempfile.mkdtemp(prefix="游戏 路径-", dir=self.base))
        shutil.copy2(ROOT / "docker.run.sh", root / "docker.run.sh")
        (root / "docker.config.cfg").write_text("# fixture\n", encoding="ascii")
        (root / "mudcore/include").mkdir(parents=True)
        (root / "data").mkdir()
        (root / "data/.env.example").write_text("DEBUG : false\n", encoding="ascii")
        name = "mud-launcher-test-" + uuid.uuid4().hex[:12]
        self.names.append(name)
        sockets = []
        try:
            for _ in range(3):
                sock = socket.socket()
                sock.bind(("127.0.0.1", 0))
                sockets.append(sock)
            ports = [str(sock.getsockname()[1]) for sock in sockets]
        finally:
            for sock in sockets:
                sock.close()
        env = dict(os.environ, MUD_DOCKER_IMAGE=self.image, MUD_DOCKER_NAME=name,
                   MUD_TELNET_PORT=ports[0], MUD_UTF8_PORT=ports[1], MUD_WEB_PORT=ports[2],
                   MUD_BIND_IP="127.0.0.1", MUD_DOCKER_NETWORK="bridge", MUD_STOP_TIMEOUT="5", MUD_START_TIMEOUT="15")
        return root, name, env

    def command(self, root, command):
        return [BASH, "-c", 'export PATH="/usr/bin:$PATH"; exec /usr/bin/bash "$@"',
                "launcher-test", str(root / "docker.run.sh"), command]

    def invoke(self, project, command, expected=0):
        root, _, env = project
        result = subprocess.run(self.command(root, command), cwd=self.base, env=env,
                                capture_output=True, encoding="utf-8", errors="replace",
                                timeout=35, creationflags=FLAGS)
        self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
        return result

    def inspect(self, name):
        return json.loads(self.docker("container", "inspect", name).stdout)[0]

    def wait_running(self, name):
        for _ in range(100):
            result = self.docker("container", "inspect", name, check=False)
            if result.returncode == 0 and json.loads(result.stdout)[0]["State"]["Running"]:
                return
            time.sleep(0.1)
        self.fail("Container did not start: " + name)

    def test_lifecycle_paths_ports_and_other_project_isolation(self):
        first = self.project()
        second = self.project()
        self.invoke(first, "status", 3)
        self.invoke(first, "start")
        container = self.inspect(first[1])
        self.assertEqual(container["Config"]["WorkingDir"], "/opt/mud")
        mount = next(m for m in container["Mounts"] if m["Destination"] == "/opt/mud")
        self.assertTrue(mount["RW"])
        self.assertTrue(container["Config"]["Labels"]["org.mud.project"])
        for port, env_key in (("5566/tcp", "MUD_TELNET_PORT"), ("6666/tcp", "MUD_UTF8_PORT"), ("80/tcp", "MUD_WEB_PORT")):
            self.assertEqual(container["HostConfig"]["PortBindings"][port][0]["HostPort"], first[2][env_key])
        self.assertTrue((first[0] / "log").is_dir())
        self.assertEqual((first[0] / "data/.env").read_text(), "DEBUG : false\n")
        (first[0] / "data/.env").write_text("keep me\n", encoding="ascii")
        self.invoke(first, "start")
        self.assertEqual(self.inspect(first[1])["Id"], container["Id"])
        self.invoke(second, "start")
        self.invoke(first, "restart")
        self.assertNotEqual(self.inspect(first[1])["Id"], container["Id"])
        self.assertEqual((first[0] / "data/.env").read_text(), "keep me\n")
        self.assertTrue(self.inspect(second[1])["State"]["Running"])
        # Status and stop do not depend on the configuration or installed image.
        (first[0] / "docker.config.cfg").unlink()
        self.invoke(first, "status")
        self.invoke(first, "stop")
        self.invoke(first, "status", 3)
        self.invoke(first, "stop")
        self.assertTrue(self.inspect(second[1])["State"]["Running"])

    def test_help_and_invalid_command_do_not_create_container(self):
        project = self.project()
        self.assertIn("用法：", self.invoke(project, "help").stdout)
        self.invoke(project, "invalid", 1)
        self.invoke(project, "status", 3)
        self.assertFalse((project[0] / "data/.env").exists())

    def test_foreign_container_is_never_controlled(self):
        project = self.project()
        self.docker("run", "-d", "--name", project[1], "--label", "org.mud.project=another-project", self.image)
        for command in ("start", "restart", "stop", "status", "logs"):
            result = self.invoke(project, command, 1)
            self.assertIn("不属于当前项目", result.stderr)
            self.assertTrue(self.inspect(project[1])["State"]["Running"])

    def test_invalid_restart_keeps_running_container(self):
        project = self.project()
        self.invoke(project, "start")
        original = self.inspect(project[1])["Id"]
        project[2]["MUD_WEB_PORT"] = "invalid"
        self.invoke(project, "restart", 1)
        self.assertTrue(self.inspect(project[1])["State"]["Running"])
        project[2]["MUD_WEB_PORT"] = "65534"
        (project[0] / "docker.config.cfg").unlink()
        self.invoke(project, "restart", 1)
        self.assertEqual(self.inspect(project[1])["Id"], original)
        self.assertTrue(self.inspect(project[1])["State"]["Running"])

    def test_occupied_port_does_not_start_second_game(self):
        first = self.project()
        second = self.project()
        self.invoke(first, "start")
        second[2]["MUD_WEB_PORT"] = first[2]["MUD_WEB_PORT"]
        self.invoke(second, "start", 125)
        self.assertTrue(self.inspect(first[1])["State"]["Running"])
        self.assertFalse(self.inspect(second[1])["State"]["Running"])

    def test_failed_start_never_enables_restart(self):
        project = self.project()
        (project[0] / "data/fail-start").touch()
        self.invoke(project, "start", 1)
        container = self.inspect(project[1])
        self.assertEqual(container["HostConfig"]["RestartPolicy"]["Name"], "no")
        self.assertEqual(container["RestartCount"], 0)
        self.assertFalse(container["State"]["Running"])

    def test_health_timeout_never_reports_success(self):
        project = self.project()
        (project[0] / "data/never-ready").touch()
        project[2]["MUD_START_TIMEOUT"] = "2"
        result = self.invoke(project, "start", 1)
        self.assertNotIn("游戏容器已启动", result.stdout)
        self.assertIn("未启用自动重启", result.stderr)
        container = self.inspect(project[1])
        self.assertEqual(container["HostConfig"]["RestartPolicy"]["Name"], "no")

    def test_foreground_logs_and_stop(self):
        project = self.project()
        output = self.base / ("foreground-" + project[1] + ".txt")
        with output.open("wb") as stream:
            process = subprocess.Popen(self.command(project[0], "run"), cwd=self.base, env=project[2],
                                       stdout=stream, stderr=subprocess.STDOUT, creationflags=FLAGS)
        self.addCleanup(lambda: process.poll() is None and process.terminate())
        self.wait_running(project[1])
        self.invoke(project, "status")
        self.invoke(project, "run", 1)
        log_output = self.base / ("logs-" + project[1] + ".txt")
        with log_output.open("wb") as stream:
            viewer = subprocess.Popen(self.command(project[0], "logs"), cwd=self.base, env=project[2],
                                      stdout=stream, stderr=subprocess.STDOUT, creationflags=FLAGS)
        try:
            for _ in range(100):
                if "fixture ready 中文" in log_output.read_text(encoding="utf-8"):
                    break
                time.sleep(0.1)
            else:
                self.fail("Container logs did not arrive")
        finally:
            viewer.terminate()
            viewer.wait(timeout=10)
        self.assertTrue(self.inspect(project[1])["State"]["Running"])
        self.invoke(project, "stop")
        self.assertEqual(process.wait(timeout=10), 0)
        self.invoke(project, "status", 3)


if __name__ == "__main__":
    unittest.main()
