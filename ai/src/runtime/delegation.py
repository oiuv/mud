"""Authorized leaf delegation through trusted business adapters, never raw models."""
import hashlib
import json
import re
import uuid
from dataclasses import dataclass, replace

from .context import Budget, RunState
from .contracts import Contract, RuntimeFault
from .tools import Tool


HANDOFF = Contract({
    "type": "object", "required": ["status", "summary", "pending"],
    "properties": {
        "status": {"enum": ["completed", "needs_input", "incomplete", "failed", "cancelled", "pending"]},
        "summary": {"type": "string", "maxLength": 8000},
        "pending": {"type": "array", "maxItems": 20, "items": {"type": "string", "maxLength": 500}},
        "result_ref": {"type": "string", "pattern": "^result:[a-f0-9]{32}$"},
        "conclusions": {"type": "array", "maxItems": 20, "items": {
            "type": "object", "required": ["text", "evidence"], "additionalProperties": False,
            "properties": {"text": {"type": "string", "maxLength": 1000},
                           "evidence": {"type": "array", "maxItems": 10,
                                        "items": {"type": "string", "maxLength": 128}}}}},
        "limitations": {"type": "array", "maxItems": 20, "items": {"type": "string", "maxLength": 500}},
        "receipt": {"type": "object", "additionalProperties": False, "required": ["content_key", "status"],
                    "properties": {"content_key": {"type": "string", "pattern": "^[a-f0-9]{64}$"},
                                   "status": {"enum": ["accepted", "pending", "ready", "failed", "retry_later"]}}},
    }, "additionalProperties": False,
})


@dataclass(frozen=True)
class Delegate:
    """Only trusted assembly can bind a business handler and its entry authority."""
    name: str
    description: str
    parameters: Contract
    handler: object
    authorize: object

    def __post_init__(self):
        if (not re.fullmatch(r"[a-z][a-z0-9_]{0,63}", self.name) or not self.description
                or not isinstance(self.parameters, Contract)
                or not callable(self.handler) or not callable(self.authorize)):
            raise ValueError("Invalid delegation binding")


class Delegations:
    def __init__(self, delegates=()):
        self._delegates = {}
        for delegate in delegates:
            if delegate.name in self._delegates:
                raise ValueError("Duplicate delegation binding")
            self._delegates[delegate.name] = delegate

    def _authorize(self, context, name):
        context.check()
        delegate = self._delegates.get(name)
        if delegate is None or name not in context.policy.agents or name in context.ancestors:
            raise RuntimeFault("agent_denied")
        if context.delegation_depth >= 1 or context.budget.limits.depth < 1:
            raise RuntimeFault("delegation_depth")
        delegate.authorize(context)
        return delegate

    def list(self, context, arguments):
        available = []
        for name in sorted(self._delegates):
            try:
                delegate = self._authorize(context, name)
            except RuntimeFault:
                context.check()
                continue
            available.append({"name": name, "description": delegate.description,
                              "parameters": delegate.parameters.schema})
        return {"agents": available}

    def authorize_invoke(self, context, arguments):
        self._authorize(context, arguments["name"]).parameters.validate(arguments["input"], 32768)

    def invoke(self, context, arguments):
        delegate = self._authorize(context, arguments["name"])
        payload = delegate.parameters.validate(arguments["input"], 32768)
        # A cancelled waiter cannot leave an old child overlapping a new one.
        if not context.state.delegation_lock.acquire(blocking=False):
            raise RuntimeFault("delegation_busy")
        try:
            context.budget.reserve(context.deadline, delegations=1)
            # Stable business subrequest identity; root correlation, actor, session,
            # ceilings and cancellation remain the same. Never copy parent history.
            key = hashlib.sha256(json.dumps([context.request_id, delegate.name, payload],
                                           sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()
            child = replace(context, request_id="delegate-" + key,
                            run_id=uuid.uuid4().hex, parent_id=context.run_id,
                            delegation_depth=context.delegation_depth + 1,
                            budget=Budget(context.budget.limits, context.budget), state=RunState())
            result = delegate.handler(child, payload)
            context.check()
            result = HANDOFF.validate(result, 32768)
            if "receipt" in result:
                with context.state.lock:
                    context.state.receipts[result["receipt"]["content_key"]] = dict(result["receipt"])
            if "result_ref" in result:
                stored = context.results.resolve(result["result_ref"], context)
                if result["status"] != "completed" or stored["source"] != delegate.name:
                    raise RuntimeFault("invalid_result_reference")
                with context.state.lock:
                    context.state.result_refs[result["result_ref"]] = {
                        "source": delegate.name, "summary": result["summary"],
                        "conclusions": result.get("conclusions", []),
                        "limitations": result.get("limitations", [])}
                    while len(context.state.result_refs) > context.results.max_items:
                        context.state.result_refs.pop(next(iter(context.state.result_refs)))
            return result
        finally:
            context.state.delegation_lock.release()

    def tools(self):
        yield Tool("agent.list", "列出当前会话可委派的专业业务及其参数。", Contract({
            "type": "object", "properties": {}, "additionalProperties": False}),
            Contract({"type": "object"}), self.list, concurrent_safe=True, resource="agent")
        yield Tool("agent.invoke", "顺序委派一个专业子目标；pending 仅表示后台已受理，不是完成。", Contract({
            "type": "object", "required": ["name", "input"], "additionalProperties": False,
            "properties": {"name": {"type": "string", "maxLength": 64}, "input": {"type": "object"}}}),
            HANDOFF, self.invoke, authorize=self.authorize_invoke, timeout=None,
            read_only=False, concurrent_safe=True, resource="agent", cost="mixed")
