"""One settlement per attempted operation, including pre-dispatch rejection."""
import re
import time
import uuid

from .contracts import RuntimeFault


def error_code(error, default="internal_error"):
    code = getattr(error, "code", default)
    return code if isinstance(code, str) and re.fullmatch(r"[a-z][a-z0-9_]{0,63}", code) else default


class Operation:
    def __init__(self, hooks, context, kind, **metadata):
        self.hooks, self.context, self.kind = hooks, context, kind
        self.metadata = {"call_id": uuid.uuid4().hex, **metadata}
        self.executed = False
        self.data = {}
        self.started = time.monotonic()

    def __enter__(self):
        return self

    def start(self):
        self.context.check()
        self.executed = True

    def before(self, data=None):
        return self.hooks.emit("before_" + self.kind, self.context, data, **self.metadata)

    def __exit__(self, error_type, error, traceback):
        code = error_code(error, "operation_failed") if error else ""
        if error is None:
            status = "completed"
        elif isinstance(error, RuntimeFault) and error.status == "cancelled":
            status = "cancelled"
        elif code in ("timeout", "deadline", "tool_timeout") or isinstance(error, TimeoutError):
            status = "timeout"
        elif not self.executed:
            status = "rejected"
        else:
            status = "failed"
        try:
            self.hooks.emit("after_" + self.kind, self.context, self.data,
                            **self.metadata, executed=self.executed, status=status, code=code,
                            elapsed_ms=round((time.monotonic() - self.started) * 1000),
                            budget=self.context.budget.snapshot())
        except RuntimeFault:
            # Preserve the original operation error; a failed post-hook cannot erase it.
            if error is None:
                raise
        return False
