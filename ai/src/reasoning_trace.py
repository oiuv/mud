"""Opt-in local diagnostics, separate from ordinary logs and model-visible tools."""
import json
import logging
import os
import stat
import sys
import threading


logger = logging.getLogger(__name__)
_write_lock = threading.Lock()


def write_trace(settings, record):
    """Only trusted settings choose destinations; never replay work on failure."""
    if settings.reasoning_trace_file is None and not settings.reasoning_trace_console:
        return
    try:
        line = json.dumps(record, ensure_ascii=False)
        # Provider text can echo a credential; never copy known configured keys.
        for secret in (settings.chat_api_key, settings.dashscope_api_key):
            if secret:
                line = line.replace(json.dumps(secret, ensure_ascii=False)[1:-1], "[REDACTED]")
        line += "\n"
        with _write_lock:
            if settings.reasoning_trace_file is not None:
                try:
                    flags = os.O_WRONLY | os.O_CREAT | os.O_APPEND | getattr(os, "O_NOFOLLOW", 0)
                    descriptor = os.open(settings.reasoning_trace_file, flags, 0o600)
                    with os.fdopen(descriptor, "a", encoding="utf-8", newline="\n") as stream:
                        mode = os.fstat(stream.fileno()).st_mode
                        if not stat.S_ISREG(mode) or (os.name == "posix" and stat.S_IMODE(mode) & 0o077):
                            raise PermissionError("Private regular trace file required")
                        stream.write(line)
                except Exception as error:
                    logger.warning("Reasoning trace write failed: destination=file error=%s", type(error).__name__)
            if settings.reasoning_trace_console:
                try:
                    sys.stderr.write(line)
                    sys.stderr.flush()
                except Exception as error:
                    logger.warning("Reasoning trace write failed: destination=console error=%s", type(error).__name__)
    except Exception as error:
        logger.warning("Reasoning trace unavailable: error=%s", type(error).__name__)
