"""Windows launcher integration tests using temporary, harmless driver executables.

Run: python -m unittest discover -s tools/tests -p test_run_windows.py -v
Requires Windows PowerShell 5.1 and the .NET Framework C# compiler.
"""
import concurrent.futures
import ctypes
from ctypes import wintypes
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time
import unittest


ROOT = Path(__file__).resolve().parents[2]
CREATE_NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)
WAIT_TIMEOUT = 258

if os.name == "nt":
    KERNEL = ctypes.WinDLL("kernel32", use_last_error=True)
    KERNEL.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
    KERNEL.OpenProcess.restype = wintypes.HANDLE
    KERNEL.WaitForSingleObject.argtypes = [wintypes.HANDLE, wintypes.DWORD]
    KERNEL.WaitForSingleObject.restype = wintypes.DWORD
    KERNEL.TerminateProcess.argtypes = [wintypes.HANDLE, wintypes.UINT]
    KERNEL.TerminateProcess.restype = wintypes.BOOL
    KERNEL.CloseHandle.argtypes = [wintypes.HANDLE]
    KERNEL.CloseHandle.restype = wintypes.BOOL
    KERNEL.QueryFullProcessImageNameW.argtypes = [
        wintypes.HANDLE, wintypes.DWORD, wintypes.LPWSTR, ctypes.POINTER(wintypes.DWORD)
    ]
    KERNEL.QueryFullProcessImageNameW.restype = wintypes.BOOL


@unittest.skipUnless(os.name == "nt", "Windows-only launcher")
class WindowsLauncherTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        compilers = [
            Path(os.environ["SystemRoot"]) / "Microsoft.NET" / arch / "v4.0.30319/csc.exe"
            for arch in ("Framework64", "Framework")
        ]
        compiler = next((path for path in compilers if path.is_file()), None)
        if compiler is None:
            raise unittest.SkipTest(".NET Framework C# compiler is unavailable")
        temp_root = ROOT / "temp"
        temp_root.mkdir(exist_ok=True)
        cls.temporary = tempfile.TemporaryDirectory(prefix="run-launcher-", dir=temp_root)
        cls.base = Path(cls.temporary.name).resolve()
        assert cls.base.parent == temp_root.resolve()
        cls.addClassCleanup(cls.temporary.cleanup)
        source = cls.base / "Driver.cs"
        cls.fixture = cls.base / "fixture.exe"
        source.write_text(
            'using System;\n'
            'using System.Diagnostics;\n'
            'using System.IO;\n'
            'using System.Threading;\n'
            'class Driver {\n'
            '  static int Main(string[] args) {\n'
            '    if (args.Length != 1 || args[0] != "config.cfg") return 12;\n'
            '    File.AppendAllText("started.txt", Process.GetCurrentProcess().Id + "\\n");\n'
            '    Console.WriteLine("fixture stdout ready");\n'
            '    while (!File.Exists("exit-driver")) Thread.Sleep(100);\n'
            '    return File.Exists("exit-code") ? int.Parse(File.ReadAllText("exit-code")) : 0;\n'
            '  }\n'
            '}\n', encoding="ascii"
        )
        subprocess.run(
            [str(compiler), "/nologo", "/target:exe", "/out:" + str(cls.fixture), str(source)],
            check=True, capture_output=True, timeout=30, creationflags=CREATE_NO_WINDOW
        )

    def setUp(self):
        self.projects = []
        self.handles = {}
        self.addCleanup(self.cleanup_drivers)

    def project(self, installed=True):
        path = Path(tempfile.mkdtemp(prefix="game 测试-", dir=self.base))
        self.projects.append(path)
        for filename in ("run.bat", "run.ps1"):
            shutil.copyfile(ROOT / filename, path / filename)
        (path / "ai").mkdir()
        (path / "ai/start.bat").write_text(
            '@echo off\n> "%~dp0called.txt" echo unexpected\n', encoding="ascii"
        )
        if installed:
            (path / "bin").mkdir()
            shutil.copyfile(self.fixture, path / "bin/driver.exe")
            (path / "config.cfg").write_text("port number : 0\n", encoding="ascii")
        return path

    def invoke(self, project, *arguments):
        return subprocess.run(
            [os.environ.get("COMSPEC", "cmd.exe"), "/d", "/c", "run.bat", *arguments],
            cwd=project, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            encoding="utf-8", errors="replace", timeout=30, creationflags=CREATE_NO_WINDOW
        )

    def launch(self, project, *arguments, expected=0):
        result = self.invoke(project, *arguments)
        self.track_drivers(project)
        self.assertEqual(result.returncode, expected, result.stdout)
        return result.stdout

    def pids(self, project):
        marker = project / "started.txt"
        return [int(value) for value in marker.read_text().split()] if marker.exists() else []

    def track_drivers(self, project):
        for process_id in self.pids(project):
            if process_id in self.handles:
                continue
            # Pin the exact process for assertions and cleanup, even after PID reuse.
            handle = KERNEL.OpenProcess(0x100000 | 0x1000 | 0x0001, False, process_id)
            if not handle:
                continue  # An intentionally short-lived fixture may already have exited.
            buffer = ctypes.create_unicode_buffer(32768)
            size = wintypes.DWORD(len(buffer))
            try:
                self.assertTrue(KERNEL.QueryFullProcessImageNameW(handle, 0, buffer, ctypes.byref(size)))
                self.assertEqual(
                    os.path.normcase(buffer.value),
                    os.path.normcase(str(project / "bin/driver.exe"))
                )
            except BaseException:
                KERNEL.CloseHandle(handle)
                raise
            self.handles[process_id] = handle

    def assert_running(self, process_id):
        self.assertIn(process_id, self.handles)
        self.assertEqual(KERNEL.WaitForSingleObject(self.handles[process_id], 0), WAIT_TIMEOUT)

    def assert_stopped(self, process_id):
        self.assertIn(process_id, self.handles)
        self.assertEqual(KERNEL.WaitForSingleObject(self.handles[process_id], 3000), 0)

    def cleanup_drivers(self):
        try:
            for project in self.projects:
                (project / "exit-driver").touch()
                self.track_drivers(project)
        finally:
            for handle in self.handles.values():
                if KERNEL.WaitForSingleObject(handle, 3000) == WAIT_TIMEOUT:
                    KERNEL.TerminateProcess(handle, 0)
                    KERNEL.WaitForSingleObject(handle, 3000)
                KERNEL.CloseHandle(handle)

    def start_console(self, project, command):
        output = project / (command + "-output.txt")
        with output.open("wb") as stream:
            process = subprocess.Popen(
                ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass",
                 "-File", str(project / "run.ps1"), command],
                cwd=project, stdout=stream, stderr=subprocess.STDOUT,
                creationflags=CREATE_NO_WINDOW
            )

        def cleanup():
            if process.poll() is None:
                process.terminate()
                process.wait(timeout=10)

        self.addCleanup(cleanup)
        return process, output

    def wait_output(self, output, text):
        deadline = time.monotonic() + 15
        while time.monotonic() < deadline:
            content = output.read_text(encoding="utf-8", errors="replace")
            if text in content:
                return content
            time.sleep(0.1)
        self.fail("Output never contained " + repr(text) + ":\n" + content)

    def test_lifecycle_and_other_game_isolation(self):
        first = self.project()
        second = self.project()
        output = self.launch(first)
        self.assertIn("如需使用 AI 功能", output)
        self.assertIn("ai\\start.bat", output)
        first_pid = self.pids(first)[-1]
        self.assert_running(first_pid)
        self.assertIn(str(first_pid), self.launch(first, "status"))

        output = self.launch(first, "start")
        self.assertIn("已在运行", output)
        self.assertIn("如需使用 AI 功能", output)
        self.assertEqual(self.pids(first), [first_pid])

        self.launch(second, "start")
        second_pid = self.pids(second)[-1]
        output = self.launch(first, "restart")
        self.assertIn("游戏驱动已停止", output)
        self.assertIn("如需使用 AI 功能", output)
        replacement_pid = self.pids(first)[-1]
        self.assertNotEqual(first_pid, replacement_pid)
        self.assert_stopped(first_pid)
        self.assert_running(replacement_pid)
        self.assert_running(second_pid)

        # Lifecycle commands must still work if the configuration goes missing.
        (first / "config.cfg").unlink()
        self.assertIn(str(replacement_pid), self.launch(first, "STATUS"))
        self.launch(first, "stop")
        self.assert_stopped(replacement_pid)
        self.assert_running(second_pid)
        self.launch(first, "status", expected=3)
        self.assertIn("未运行", self.launch(first, "stop"))
        for project in (first, second):
            self.assertFalse((project / "ai/called.txt").exists())

    def test_help_validation_and_uninstalled_status(self):
        project = self.project(installed=False)
        help_text = self.launch(project, "help")
        self.assertIn("用法：run.bat [start|stop|restart|status|run|logs|help]", help_text)
        self.assertIn("后台启动游戏驱动（默认）", help_text)
        self.assertIn("如需使用 AI 功能，请单独启动 AI 服务：", help_text)
        self.assertNotIn("\ufffd", help_text)
        self.launch(project, "status", expected=3)
        self.launch(project, "stop")
        for arguments in (("unknown",), ("stop", "extra"), ("help", "extra")):
            self.assertIn("用法：", self.launch(project, *arguments, expected=1))
        self.assertIn("找不到 driver.exe", self.launch(project, "start", expected=1))
        self.assertIn("找不到 driver.exe", self.launch(project, "restart", expected=1))
        self.assertFalse(self.pids(project))
        self.assertFalse((project / "ai/called.txt").exists())

    def test_busy_port_prevents_start(self):
        project = self.project()
        with socket.socket() as listener:
            listener.bind(("127.0.0.1", 0))
            listener.listen()
            (project / "config.cfg").write_text(
                "mud ip : 127.0.0.1\nport number : " + str(listener.getsockname()[1]) + "\n",
                encoding="ascii"
            )
            for command in ("start", "run"):
                self.assertIn("端口已被占用", self.launch(project, command, expected=1))
        self.assertFalse(self.pids(project))
        self.launch(project, "status", expected=3)

    def test_concurrent_start_creates_one_driver(self):
        project = self.project()
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(lambda _: self.invoke(project, "start"), range(2)))
        self.track_drivers(project)
        for result in results:
            self.assertEqual(result.returncode, 0, result.stdout)
            self.assertIn("如需使用 AI 功能", result.stdout)
        self.assertEqual(len(self.pids(project)), 1)
        self.assertEqual(sum("已在运行" in result.stdout for result in results), 1)
        self.assert_running(self.pids(project)[0])

    def test_restart_when_stopped_and_missing_config(self):
        project = self.project()
        self.assertIn("游戏驱动已启动", self.launch(project, "restart"))
        process_id = self.pids(project)[-1]
        (project / "config.cfg").unlink()
        self.assertIn("找不到配置文件", self.launch(project, "restart", expected=1))
        self.assert_running(process_id)

    def test_immediate_driver_exit_is_failure(self):
        project = self.project()
        (project / "exit-driver").touch()
        output = self.launch(project, "start", expected=1)
        self.assertIn("在启动期间退出", output)
        self.assertNotIn("如需使用 AI 功能", output)
        self.launch(project, "status", expected=3)


    def test_foreground_releases_lock_and_can_be_stopped(self):
        project = self.project()
        process, output = self.start_console(project, "run")
        content = self.wait_output(output, "如需使用 AI 功能")
        self.assertIn("fixture stdout ready", content)
        self.assertIsNone(process.poll())
        self.track_drivers(project)
        process_id = self.pids(project)[-1]
        self.assertIn(str(process_id), self.launch(project, "status"))
        self.assertIn("已在运行", self.launch(project, "run", expected=1))
        self.assertEqual(self.pids(project), [process_id])
        self.launch(project, "stop")
        self.assert_stopped(process_id)
        process.wait(timeout=10)
        self.assertFalse((project / "ai/called.txt").exists())

    def test_foreground_preserves_exit_code(self):
        project = self.project()
        (project / "exit-code").write_text("7", encoding="ascii")
        process, output = self.start_console(project, "run")
        self.wait_output(output, "如需使用 AI 功能")
        self.track_drivers(project)
        (project / "exit-driver").touch()
        self.assertEqual(process.wait(timeout=10), 7, output.read_text(encoding="utf-8"))
        self.assert_stopped(self.pids(project)[-1])
        # Also exercise batch forwarding and exit codes for a short-lived driver.
        self.launch(project, "run", expected=7)

    def test_logs_tail_follow_and_viewer_exit_leave_driver_running(self):
        project = self.project()
        (project / "config.cfg").write_text(
            "port number : 0\n"
            "log directory : /custom logs # startup-relative path\n"
            "debug log file : driver-debug.log\n"
            "debug log file : ignored.log\n",
            encoding="ascii"
        )
        log_file = project / "custom logs/driver-debug.log"
        log_file.parent.mkdir()
        lines = ["old-line-" + str(index) for index in range(120)]
        lines[-1] = "中文日志"
        log_file.write_text("\n".join(lines) + "\n", encoding="utf-8")
        self.launch(project, "start")
        process_id = self.pids(project)[-1]

        viewer, output = self.start_console(project, "logs")
        content = self.wait_output(output, "中文日志")
        self.assertIn("old-line-20\n", content)
        self.assertNotIn("old-line-19\n", content)
        self.assertIn("driver-debug.log", content)
        self.assertIn(str(process_id), self.launch(project, "status"))
        with log_file.open("a", encoding="utf-8") as stream:
            stream.write("new-log-line\n")
        self.wait_output(output, "new-log-line")
        viewer.terminate()
        viewer.wait(timeout=10)
        self.assert_running(process_id)
        self.assertFalse((project / "ai/called.txt").exists())

    def test_logs_missing_does_not_start_driver(self):
        project = self.project()
        output = self.launch(project, "logs", expected=1)
        self.assertIn("日志文件尚未生成", output)
        self.assertIn("debug.log", output)
        self.assertFalse(self.pids(project))
        self.assertFalse((project / "ai/called.txt").exists())


if __name__ == "__main__":
    unittest.main()
