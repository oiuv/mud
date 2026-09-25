"""Small trusted hook dispatcher. Timeouts do not kill Python callbacks."""
import logging
import queue
import threading
import time
from dataclasses import dataclass, field

from .contracts import RuntimeFault, freeze, json_text, parse_json

logger = logging.getLogger(__name__)
EVENTS = frozenset(("run_start", "before_model", "after_model", "before_tool", "after_tool",
                    "before_commit", "run_end", "run_error"))
TERMINAL_EVENTS = frozenset(("run_end", "run_error"))
CHANGE_FIELDS = {"before_model": {"additional_context"}, "before_tool": {"arguments"}}


@dataclass(frozen=True)
class Decision:
    action: str = "allow"
    changes: dict = field(default_factory=dict)


@dataclass(frozen=True)
class Hook:
    event: str
    callback: object
    intervention: bool = False
    timeout: float = .1
    raw_data: bool = False

    def __post_init__(self):
        if self.event not in EVENTS or not callable(self.callback) or not 0 < self.timeout <= 1:
            raise ValueError("Invalid hook")
        if self.raw_data and not self.intervention:
            raise ValueError("Observers receive metadata only")
        if self.intervention and self.event in TERMINAL_EVENTS:
            raise ValueError("Terminal hooks are observers only")


class Hooks:
    def __init__(self, hooks=()):
        self.hooks = tuple(hooks)
        self._slots = threading.BoundedSemaphore(4)
        self._local = threading.local()
        self.failures = 0

    def _call(self, hook, event, timeout):
        if timeout <= 0:
            raise RuntimeFault("hook_timeout")
        if not self._slots.acquire(blocking=False):
            raise RuntimeFault("hook_capacity")
        output = queue.Queue(maxsize=1)
        def invoke():
            self._local.active = True
            try:
                output.put((True, hook.callback(event)))
            except Exception:
                output.put((False, None))
            finally:
                self._local.active = False
                self._slots.release()
        try:
            threading.Thread(target=invoke, daemon=True, name="ai-hook").start()
        except Exception:
            self._slots.release()
            raise
        try:
            success, result = output.get(timeout=timeout)
        except queue.Empty:
            raise RuntimeFault("hook_timeout") from None
        if not success:
            raise RuntimeFault("hook_failed")
        return result

    def emit(self, event, context, data=None, **metadata):
        if event not in EVENTS:
            raise ValueError("Unknown lifecycle event")
        if getattr(self._local, "active", False):
            raise RuntimeFault("recursive_hook")
        # Metadata is selected by trusted callers; raw payload is never logged.
        trace = {"event": event, "run_id": context.run_id, "root_id": context.root_id,
                 "parent_id": context.parent_id, "agent": context.agent_id,
                 "policy": context.policy.version, **metadata}
        logger.info("AI lifecycle %s", json_text(trace, 8192))
        current = parse_json(json_text(data or {}))
        denied = None
        for hook in self.hooks:
            if hook.event != event:
                continue
            if denied is not None and hook.intervention:
                continue
            try:
                observed = dict(trace)
                if hook.raw_data:
                    observed["data"] = current
                # Observers must still see cancellation/deadline/failure settlement.
                timeout = min(hook.timeout, context.deadline - time.monotonic()) if hook.intervention else hook.timeout
                decision = self._call(hook, freeze(observed), timeout)
                if not hook.intervention:
                    continue
                if not isinstance(decision, Decision) or decision.action not in ("allow", "deny", "cancel"):
                    raise RuntimeFault("invalid_hook_decision")
                if decision.action == "cancel":
                    context.budget.cancelled.set()
                    raise RuntimeFault("cancelled", "cancelled")
                if decision.action == "deny":
                    raise RuntimeFault("hook_denied")
                changes = parse_json(json_text(decision.changes))
                if not isinstance(changes, dict) or not set(changes) <= CHANGE_FIELDS.get(event, set()):
                    raise RuntimeFault("hook_field_denied")
                if "additional_context" in changes:
                    additions = changes["additional_context"]
                    if not isinstance(additions, list) or len(additions) > 8:
                        raise RuntimeFault("invalid_hook_context")
                    for item in additions:
                        if (not isinstance(item, dict) or set(item) != {"text", "scope"}
                                or not isinstance(item["text"], str) or not item["text"].strip()
                                or not isinstance(item["scope"], str)):
                            raise RuntimeFault("invalid_hook_context")
                        if item["scope"] not in context.policy.scopes:
                            raise RuntimeFault("scope_denied")
                        if context.external_model and item["scope"] not in context.policy.egress_scopes:
                            raise RuntimeFault("egress_denied")
                    combined = current.get("additional_context", []) + additions
                    json_text(combined, 8192)
                    current["additional_context"] = combined
                if "arguments" in changes:
                    current["arguments"] = changes["arguments"]
            except Exception as error:
                self.failures += 1
                logger.warning("AI hook failure: event=%s intervention=%s error=%s",
                               event, hook.intervention, type(error).__name__)
                if hook.intervention:
                    denied = error if isinstance(error, RuntimeFault) else RuntimeFault("hook_failed")
        if denied is not None:
            raise denied
        return current
