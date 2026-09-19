"""MSYS2 build-script flow checks with mocked external build/update commands.

Run on Windows with MSYS2:
    python -m unittest discover -s tools/tests -p test_build_msys2.py -v
No packages, real source checkouts, or installed drivers are changed.
"""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[2]
BASH = Path(os.environ.get("MSYS2_ROOT", "C:/msys64")) / "usr/bin/bash.exe"
HARNESS = r"""
set -euo pipefail
export PATH="/mingw64/bin:/usr/bin:$PATH"
record() {
    printf '%s' "$1" >> "$BUILD_TEST_ROOT/calls.txt"
    shift
    printf ' <%s>' "$@" >> "$BUILD_TEST_ROOT/calls.txt"
    printf '\n' >> "$BUILD_TEST_ROOT/calls.txt"
}
pacman() {
    record pacman "$@"
    [[ "$BUILD_TEST_FAIL" != pacman ]]
}
git() {
    record git "$@"
    if [[ "$*" == *rev-parse* ]]; then
        if [[ "$BUILD_TEST_FAIL" == wrong_repo ]]; then
            printf '%s\n' "$BUILD_TEST_ROOT"
        else
            printf '%s/fluffos\n' "$BUILD_TEST_ROOT"
        fi
    elif [[ "$*" == *checkout* ]]; then
        [[ "$BUILD_TEST_FAIL" != checkout ]]
    elif [[ "$*" == *pull* ]]; then
        [[ "$BUILD_TEST_FAIL" != pull ]]
    else
        return 1
    fi
}
gcc() { printf 'x86_64-w64-mingw32\n'; }
cmake() {
    record cmake "$@"
    case "$1" in
        --build)
            [[ "$BUILD_TEST_FAIL" != build ]]
            ;;
        --install)
            [[ "$BUILD_TEST_FAIL" != install ]] || return 1
            mkdir -p "$BUILD_TEST_ROOT/fluffos/build-msys2/bin"
            printf 'new driver\n' > "$BUILD_TEST_ROOT/fluffos/build-msys2/bin/driver.exe"
            printf 'new compiler\n' > "$BUILD_TEST_ROOT/fluffos/build-msys2/bin/lpcc.exe"
            ;;
        *)
            [[ "$BUILD_TEST_FAIL" != configure ]]
            ;;
    esac
}
powershell.exe() {
    record powershell "$@"
    case "$BUILD_TEST_FAIL" in
        running) return 2 ;;
        inspect) return 1 ;;
        *) return 0 ;;
    esac
}
export -f record pacman git gcc cmake powershell.exe
if [[ "$BUILD_TEST_REAL_PS" == 1 ]]; then unset -f powershell.exe; fi
BUILD_TEST_ROOT="$(cygpath -au "$BUILD_TEST_ROOT")"
export BUILD_TEST_ROOT
exec /usr/bin/bash "$BUILD_TEST_ROOT/build_msys2.sh" "$@"
"""


@unittest.skipUnless(os.name == "nt" and BASH.is_file(), "Windows MSYS2 bash required")
class Msys2BuildTests(unittest.TestCase):
    def setUp(self):
        temp_root = ROOT / "temp"
        temp_root.mkdir(exist_ok=True)
        self.temporary = tempfile.TemporaryDirectory(prefix="build flow 中文-", dir=temp_root)
        self.root = Path(self.temporary.name).resolve()
        self.assertEqual(self.root.parent, temp_root.resolve())
        self.addCleanup(self.temporary.cleanup)
        shutil.copyfile(ROOT / "build_msys2.sh", self.root / "build_msys2.sh")
        (self.root / "fluffos").mkdir()
        (self.root / "fluffos/CMakeLists.txt").write_text("# fixture\n", encoding="ascii")
        (self.root / "bin").mkdir()
        (self.root / "bin/driver.exe").write_bytes(b"old driver")
        self.harness = self.root / "harness.sh"
        self.harness.write_text(HARNESS, encoding="utf-8", newline="\n")

    def command(self, *arguments, failure="", msystem="MINGW64", jobs="2", real_process_check=False):
        (self.root / "calls.txt").write_text("", encoding="ascii")
        environment = dict(
            os.environ, BUILD_TEST_ROOT=str(self.root), BUILD_TEST_FAIL=failure,
            MSYSTEM=msystem, BUILD_JOBS=jobs,
            BUILD_TEST_REAL_PS="1" if real_process_check else "0"
        )
        result = subprocess.run(
            [str(BASH), str(self.harness), *arguments],
            cwd=ROOT / "temp", env=environment, capture_output=True,
            encoding="utf-8", errors="replace", timeout=20,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        calls = (self.root / "calls.txt").read_text(encoding="utf-8")
        return result, calls

    def assert_original_driver(self):
        self.assertEqual((self.root / "bin/driver.exe").read_bytes(), b"old driver")

    def test_default_restores_updates_builds_and_copies_exes(self):
        result, calls = self.command()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("pacman <-Syu>", calls)
        for package in ("openssl", "pkgconf", "libffi"):
            self.assertIn("mingw-w64-x86_64-" + package, calls)
        self.assertIn("<checkout> <--> <.>", calls)
        self.assertIn("<pull> <--ff-only>", calls)
        self.assertLess(calls.index("<checkout>"), calls.index("<pull>"))
        for flag in ("-DSTATIC=ON", "-DMARCH_NATIVE=OFF", "-DPACKAGE_CRYPTO=ON",
                     "-DPACKAGE_DB_SQLITE=2", "-DPACKAGE_DB_DEFAULT_DB=2"):
            self.assertIn("<" + flag + ">", calls)
        self.assertIn("<--parallel> <2>", calls)
        self.assertEqual((self.root / "bin/driver.exe").read_text(), "new driver\n")
        self.assertEqual((self.root / "bin/lpcc.exe").read_text(), "new compiler\n")
        self.assertFalse((ROOT / "temp/fluffos").exists())

    def test_local_no_install_keeps_driver_and_skips_updates(self):
        result, calls = self.command("--local", "--no-install")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        for command in ("pacman", "<checkout>", "<pull>", "powershell"):
            self.assertNotIn(command, calls)
        self.assertIn("<--install>", calls)
        self.assert_original_driver()

    def test_failure_stops_following_steps_and_never_copies(self):
        for failure, forbidden in (
            ("pacman", "<checkout>"), ("checkout", "<pull>"), ("pull", "cmake <"),
            ("configure", "<--build>"), ("build", "<--install>"), ("install", "powershell")
        ):
            with self.subTest(stage=failure):
                result, calls = self.command(failure=failure)
                self.assertNotEqual(result.returncode, 0)
                self.assertNotIn(forbidden, calls)
                self.assert_original_driver()

    def test_wrong_git_root_is_rejected_before_checkout(self):
        result, calls = self.command(failure="wrong_repo")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("独立的 Git 仓库", result.stderr)
        self.assertNotIn("<checkout>", calls)
        self.assertNotIn("cmake <", calls)
        self.assert_original_driver()

    def test_active_driver_or_failed_process_inspection_prevents_copy(self):
        for failure in ("running", "inspect"):
            with self.subTest(reason=failure):
                result, calls = self.command("--local", failure=failure)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("未复制任何文件", result.stderr)
                self.assertIn("powershell", calls)
                self.assert_original_driver()

    def test_bad_arguments_environment_and_parallelism_have_no_side_effects(self):
        for arguments, options in (
            (("--unknown",), {}), ((), {"msystem": "UCRT64"}), ((), {"jobs": "0"})
        ):
            with self.subTest(arguments=arguments, options=options):
                result, calls = self.command(*arguments, **options)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(calls, "")
                self.assert_original_driver()
        result, calls = self.command("--help", msystem="")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("用法：", result.stdout)
        self.assertEqual(calls, "")


    def test_real_windows_process_check_blocks_only_active_project_driver(self):
        compiler = Path(os.environ["SystemRoot"]) / "Microsoft.NET/Framework64/v4.0.30319/csc.exe"
        if not compiler.is_file():
            self.skipTest(".NET Framework C# compiler unavailable")
        source = self.root / "Driver.cs"
        source.write_text(
            "class Driver { static void Main() { System.Threading.Thread.Sleep(60000); } }\n",
            encoding="ascii"
        )
        executable = self.root / "bin/driver.exe"
        subprocess.run(
            [str(compiler), "/nologo", "/out:" + str(executable), str(source)],
            check=True, capture_output=True, timeout=20, creationflags=subprocess.CREATE_NO_WINDOW
        )
        original = executable.read_bytes()
        process = subprocess.Popen([str(executable)], creationflags=subprocess.CREATE_NO_WINDOW)
        try:
            result, _ = self.command("--local", real_process_check=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("正在运行，未复制任何文件", result.stderr)
            self.assertEqual(executable.read_bytes(), original)
            self.assertIsNone(process.poll())
        finally:
            if process.poll() is None:
                process.terminate()
            process.wait(timeout=10)
        result, _ = self.command("--local", real_process_check=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(executable.read_text(), "new driver\n")


if __name__ == "__main__":
    unittest.main()
