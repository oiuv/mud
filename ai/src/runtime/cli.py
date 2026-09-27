"""Bounded argv-only process calls for administrator-owned CLI definitions."""
import json
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import threading

from .contracts import RuntimeFault


def command_prefix(value):
    """Parse trusted configuration, never model-authored shell syntax."""
    try:
        parts = json.loads(value) if value.lstrip().startswith("[") else [value]
    except (ValueError, AttributeError):
        raise ValueError("CLI command must be an executable or JSON argv array") from None
    if (not isinstance(parts, list) or not parts or len(parts) > 16
            or any(not isinstance(part, str) or not part.strip()
                   or any(c in part for c in "\0\r\n") for part in parts)):
        raise ValueError("CLI command must be an executable or JSON argv array")
    return tuple(parts)


def _cmd_argument(value):
    # Batch shims forward %* into a second command parser. Quote for the native
    # child's argv, then escape both cmd parsing passes (including % and !).
    value = re.sub(r'(\\*)"', lambda m: m[1] * 2 + '\\"', value)
    value = re.sub(r"(\\+)$", lambda m: m[1] * 2, value)
    value = '"' + value + '"'
    for _ in range(2):
        value = re.sub(r'([()\[\]%!^"`<>&|;, *?])', r'^\1', value)
    return value


def process_argv(command, arguments):
    executable = shutil.which(command[0])
    if executable is None:
        raise RuntimeFault("cli_unavailable")
    suffix = Path(executable).suffix.lower()
    if suffix == ".ps1" or Path(executable).stem.lower() in ("cmd", "powershell", "pwsh", "bash", "sh"):
        raise RuntimeFault("cli_unavailable")
    argv = [executable, *command[1:], *arguments]
    if any(not isinstance(arg, str) or any(c in arg for c in "\0\r\n") for arg in argv):
        raise RuntimeFault("cli_invalid_arguments")
    if os.name == "nt" and suffix in (".cmd", ".bat"):
        shell = str(Path(os.environ["SystemRoot"]) / "System32/cmd.exe")
        escaped = re.sub(r'([()\[\]%!^"`<>&|;, *?])', r'^\1', executable)
        line = escaped + " " + " ".join(_cmd_argument(arg) for arg in argv[1:])
        # Pass an already quoted Windows command line, not list2cmdline's C
        # quoting of the cmd payload. /d and /v:off disable autorun and ! expansion.
        return f'"{shell}" /d /v:off /s /c "{line}"'
    return argv


def run_cli(command, root, arguments, context, *, max_bytes=262144):
    """Capture stdout only; faults never include process output or configuration.

    POSIX gets a new process group. On Windows cancellation asks taskkill to
    stop this invocation's tree, then reaps the direct process. This is not an
    OS sandbox or a guarantee about independently detached external processes.
    """
    context.check()
    argv = process_argv(command, arguments)
    environment = {key: value for key, value in os.environ.items()
                   if key.upper().startswith("CODEGRAPH_") or key.upper() in (
                       "PATH", "PATHEXT", "SYSTEMROOT", "WINDIR", "TEMP", "TMP", "TMPDIR",
                       "HOME", "USERPROFILE", "APPDATA", "LOCALAPPDATA", "LANG", "LC_ALL")}
    environment["NO_COLOR"] = "1"
    context.check()
    try:
        process = subprocess.Popen(argv, cwd=root, env=environment, stdin=subprocess.DEVNULL,
                                   stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, shell=False,
                                   start_new_session=os.name != "nt",
                                   creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
    except OSError:
        raise RuntimeFault("cli_unavailable") from None
    finished, output = threading.Event(), []

    def collect():
        try:
            output.append(process.stdout.read(max_bytes + 1))
        finally:
            finished.set()

    reader = threading.Thread(target=collect, daemon=True)
    reader.start()
    try:
        while not finished.wait(.02):
            context.check()
        context.check()
        if not output or len(output[0]) > max_bytes:
            raise RuntimeFault("cli_result_too_large")
        while process.poll() is None:
            context.check()
            try:
                process.wait(timeout=.02)
            except subprocess.TimeoutExpired:
                pass
        if process.returncode:
            raise RuntimeFault("cli_failed")
        try:
            return output[0].decode("utf-8")
        except UnicodeError:
            raise RuntimeFault("cli_invalid_result") from None
    finally:
        if os.name != "nt":
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
        elif process.poll() is None:
            try:
                subprocess.run([str(Path(os.environ["SystemRoot"]) / "System32/taskkill.exe"),
                                "/pid", str(process.pid), "/t", "/f"],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                               timeout=3, creationflags=subprocess.CREATE_NO_WINDOW)
            except (OSError, subprocess.TimeoutExpired):
                pass
            if process.poll() is None:
                process.kill()
        process.wait()
        reader.join(timeout=1)
        if not reader.is_alive():
            process.stdout.close()
