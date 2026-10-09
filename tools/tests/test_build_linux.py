"""Linux build-script flow checks; apt/git/cmake/system copy are mocked.

    python3 -m unittest discover -s tools/tests -p test_build_linux.py -v

Also runs under Windows Python with MSYS2_ROOT pointing to MSYS2.
Fixtures stay in the project's temp/; no packages or real drivers are changed.
"""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[2]
BASH = (
    str(Path(os.environ.get("MSYS2_ROOT", "C:/tools/msys64")) / "usr/bin/bash.exe")
    if os.name == "nt" else shutil.which("bash")
)
HARNESS = r"""
set -euo pipefail
export PATH="/usr/bin:$PATH"
if command -v cygpath >/dev/null 2>&1; then
    BUILD_TEST_ROOT="$(cygpath -au "$BUILD_TEST_ROOT")"
fi
export BUILD_TEST_ROOT
record() {
    printf '%s' "$1" >> "$BUILD_TEST_ROOT/calls.txt"
    shift
    printf ' <%s>' "$@" >> "$BUILD_TEST_ROOT/calls.txt"
    printf '\n' >> "$BUILD_TEST_ROOT/calls.txt"
}
uname() { printf '%s\n' "$BUILD_TEST_OS"; }
nproc() { printf '3\n'; }
sudo() { record sudo "$@"; "$@"; }
apt-get() { record apt-get "$@"; [[ "$BUILD_TEST_FAIL" != "apt-$1" ]]; }
gcc() { :; }
g++() { :; }
bison() { :; }
make() { :; }
pkg-config() { :; }
git() {
    record git "$@"
    if [[ "$1" == clone ]]; then
        [[ "$BUILD_TEST_FAIL" != clone ]] || return 1
        command mkdir -p -- "$3"
        printf '# fixture\n' > "$3/CMakeLists.txt"
        return 0
    fi
    case "$3" in
        rev-parse)
            if [[ "$BUILD_TEST_FAIL" == wrong_repo ]]; then
                printf '%s\n' "$BUILD_TEST_ROOT"
            else
                printf '%s/fluffos\n' "$BUILD_TEST_ROOT"
            fi
            ;;
        status)
            [[ "$BUILD_TEST_FAIL" != status ]] || return 1
            if [[ "$BUILD_TEST_FAIL" == dirty ]]; then printf ' M source.cc\n'; fi
            ;;
        pull) [[ "$BUILD_TEST_FAIL" != pull ]] ;;
        *) return 1 ;;
    esac
}
cmake() {
    record cmake "$@"
    case "$1" in
        --build) [[ "$BUILD_TEST_FAIL" != build ]] ;;
        --install)
            [[ "$BUILD_TEST_FAIL" != install ]] || return 1
            [[ "$BUILD_TEST_FAIL" != missing_driver ]] || return 0
            command mkdir -p -- "$2/bin"
            printf '#!/bin/sh\n# new driver\n' > "$2/bin/driver"
            chmod +x "$2/bin/driver"
            ;;
        *) [[ "$BUILD_TEST_FAIL" != configure ]] ;;
    esac
}
mkdir() {
    if [[ "${*: -1}" == /usr/local/games ]]; then
        record mkdir "$@"
    else
        command mkdir "$@"
    fi
}
cp() {
    record cp "$@"
    [[ "$1" == -- && "$3" == /usr/local/games/driver ]] || return 1
    [[ "$BUILD_TEST_FAIL" != copy ]] || return 1
    command cp -- "$2" "$BUILD_TEST_ROOT/installed-driver"
}
export -f record uname nproc sudo apt-get gcc g++ bison make pkg-config git cmake mkdir cp
exec /usr/bin/bash "$BUILD_TEST_ROOT/build.sh" "$@"
"""


@unittest.skipUnless(BASH and Path(BASH).is_file(), "Bash required")
class LinuxBuildTests(unittest.TestCase):
    def setUp(self):
        temp_root = ROOT / "temp"
        temp_root.mkdir(exist_ok=True)
        self.temporary = tempfile.TemporaryDirectory(prefix="linux build 中文-", dir=temp_root)
        self.root = Path(self.temporary.name).resolve()
        self.assertEqual(self.root.parent, temp_root.resolve())
        self.addCleanup(self.temporary.cleanup)
        shutil.copyfile(ROOT / "build.sh", self.root / "build.sh")
        (self.root / "fluffos").mkdir()
        (self.root / "fluffos/CMakeLists.txt").write_text("# fixture\n", encoding="ascii")
        (self.root / "installed-driver").write_bytes(b"old driver")
        self.harness = self.root / "harness.sh"
        self.harness.write_text(HARNESS, encoding="utf-8", newline="\n")

    def command(self, *arguments, failure="", jobs="2", system="Linux"):
        (self.root / "calls.txt").write_text("", encoding="ascii")
        environment = dict(
            os.environ, BUILD_TEST_ROOT=str(self.root), BUILD_TEST_FAIL=failure,
            BUILD_JOBS=jobs, BUILD_TEST_OS=system,
        )
        result = subprocess.run(
            [BASH, str(self.harness), *arguments], cwd=ROOT / "temp", env=environment,
            capture_output=True, encoding="utf-8", errors="replace", timeout=30,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
        )
        return result, (self.root / "calls.txt").read_text(encoding="utf-8")

    def assert_success(self, result):
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def assert_original_driver(self):
        self.assertEqual((self.root / "installed-driver").read_bytes(), b"old driver")

    def test_default_builds_linux_release_all_databases_and_copies_driver(self):
        result, calls = self.command()
        self.assert_success(result)
        self.assertIn("apt-get <update>", calls)
        self.assertIn("apt-get <install> <-y>", calls)
        for package in (
            "build-essential", "autoconf", "automake", "bison", "flex", "expect",
            "libmysqlclient-dev", "libpcre2-dev", "libpq-dev", "libsqlite3-dev",
            "libssl-dev", "libtool", "zlib1g-dev", "telnet", "libjemalloc-dev",
            "libicu-dev", "libgtest-dev", "pkg-config", "libffi-dev", "libdw-dev", "libbz2-dev",
        ):
            self.assertIn(f"<{package}>", calls)
        self.assertNotIn("libpcre3-dev", calls)
        self.assertIn("<pull> <--ff-only> <https://github.com/fluffos/fluffos.git>", calls)
        for flag in (
            "-DCMAKE_BUILD_TYPE=Release", "-DSTATIC=OFF", "-DMARCH_NATIVE=OFF",
            "-DPACKAGE_CRYPTO=ON", "-DPACKAGE_DB=ON", "-DPACKAGE_DB_MYSQL=2",
            "-DPACKAGE_DB_POSTGRESQL=3", "-DPACKAGE_DB_SQLITE=1", "-DPACKAGE_DB_DEFAULT_DB=1",
        ):
            self.assertIn(f"<{flag}>", calls)
        self.assertIn("<-G> <Unix Makefiles>", calls)
        self.assertIn("<-U> <PCRE_LIBRARY> <-U> <PCRE_INCLUDE_DIR>", calls)
        self.assertIn("<--parallel> <2>", calls)
        self.assertIn("<--target> <driver> <lpcc> <lpcshell> <symbol> <o2json> <json2o> <portbind>", calls)
        self.assertIn("/fluffos/build>", calls)
        self.assertEqual((self.root / "installed-driver").read_bytes(), b"#!/bin/sh\n# new driver\n")

    def test_local_no_install_preserves_incremental_data_and_driver(self):
        build = self.root / "fluffos/build"
        build.mkdir()
        (build / "keep.o").write_bytes(b"incremental")
        result, calls = self.command("--local", "--no-install", failure="dirty")
        self.assert_success(result)
        for command in ("apt-get", "<clone>", "<pull>", "<status>", "sudo", "cp <"):
            self.assertNotIn(command, calls)
        self.assertIn("<--install>", calls)
        self.assertEqual((build / "keep.o").read_bytes(), b"incremental")
        self.assert_original_driver()

    def test_debug_native_and_relative_directory_then_restore_defaults(self):
        for options, mode, native in (
            (("--debug", "--march-native"), "Debug", "ON"), ((), "Release", "OFF"),
        ):
            with self.subTest(options=options):
                result, calls = self.command(
                    "--local", "--no-install", "--build-dir", "fluffos/custom 中文", *options,
                )
                self.assert_success(result)
                self.assertIn(f"<-DCMAKE_BUILD_TYPE={mode}>", calls)
                self.assertIn(f"<-DMARCH_NATIVE={native}>", calls)
                source = calls.split("<rev-parse>")[0].split("git <-C> <", 1)[1].split(">", 1)[0]
                directory = source + "/custom 中文"
                for option in ("-B", "--build", "--install"):
                    self.assertIn(f"<{option}> <{directory}>", calls)
                self.assertIn(f"<-DCMAKE_INSTALL_PREFIX={directory}>", calls)
                self.assertTrue((self.root / "fluffos/custom 中文/bin/driver").is_file())
                self.assertFalse((self.root / "fluffos/build").exists())
                self.assert_original_driver()

    @unittest.skipIf(os.name == "nt", "Linux absolute path test")
    def test_absolute_directory_and_source_symlink(self):
        directory = self.root / "out 中文"
        result, calls = self.command("--local", "--no-install", "--build-dir", str(directory))
        self.assert_success(result)
        self.assertIn(f"<-B> <{directory}>", calls)
        (self.root / "source-link").symlink_to(self.root / "fluffos", target_is_directory=True)
        result, calls = self.command("--local", "--no-install", "--build-dir", "source-link")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(calls, "")
        self.assert_original_driver()

    def test_dirty_or_failed_git_status_never_pulls_or_builds(self):
        for failure in ("dirty", "status", "wrong_repo"):
            with self.subTest(failure=failure):
                result, calls = self.command(failure=failure)
                self.assertNotEqual(result.returncode, 0)
                for command in ("<pull>", "<checkout>", "<reset>", "<stash>", "cmake <"):
                    self.assertNotIn(command, calls)
                self.assert_original_driver()

    def test_missing_source_local_fails_and_default_clones_official_repo(self):
        (self.root / "fluffos/CMakeLists.txt").unlink()
        (self.root / "fluffos").rmdir()
        result, calls = self.command("--local", "--no-install")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(calls, "")
        result, calls = self.command("--no-install", failure="clone")
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn("cmake <", calls)
        result, calls = self.command("--no-install")
        self.assert_success(result)
        self.assertIn("git <clone> <https://github.com/fluffos/fluffos.git>", calls)
        self.assert_original_driver()

    def test_failures_stop_later_stages_and_preserve_installed_driver(self):
        for failure, forbidden in (
            ("apt-update", "<install> <-y>"), ("apt-install", "git <"),
            ("pull", "cmake <"), ("configure", "<--build>"),
            ("build", "<--install>"), ("install", "cp <"),
            ("missing_driver", "cp <"), ("copy", "__unused__"),
        ):
            with self.subTest(failure=failure):
                result, calls = self.command(failure=failure)
                self.assertNotEqual(result.returncode, 0)
                self.assertNotIn(forbidden, calls)
                self.assert_original_driver()

    def test_invalid_options_paths_and_environment_have_no_side_effects(self):
        for arguments, options in (
            (("--unknown",), {}), ((), {"system": "MINGW64_NT"}),
            ((), {"jobs": "0"}), ((), {"jobs": "-1"}), ((), {"jobs": "a"}),
            (("--build-dir",), {}), (("--build-dir", ""), {}),
            (("--build-dir", "--debug"), {}), (("--build-dir", "."), {}),
            (("--build-dir", "fluffos"), {}), (("--build-dir", "fluffos/.."), {}),
            (("--build-dir", ".."), {}), (("--build-dir", "/"), {}),
        ):
            with self.subTest(arguments=arguments, options=options):
                result, calls = self.command(*arguments, **options)
                self.assertNotEqual(result.returncode, 0)
                self.assertEqual(calls, "")
                self.assert_original_driver()
        result, calls = self.command("--help", system="MINGW64_NT")
        self.assert_success(result)
        for option in ("--local", "--no-install", "--build-dir", "--debug", "--march-native"):
            self.assertIn(option, result.stdout)
        self.assertEqual(calls, "")

    def test_parallelism_defaults_to_available_processors(self):
        result, calls = self.command("--local", "--no-install", jobs="")
        self.assert_success(result)
        self.assertIn("<--parallel> <3>", calls)


if __name__ == "__main__":
    unittest.main()
