"""Trusted tool registration and a single bounded execution boundary."""
import importlib
import pkgutil
import re
import threading
import time
from dataclasses import dataclass, replace

from .calls import Calls
from .contracts import Contract, RuntimeFault, json_text, parse_json
from .hooks import Hooks
from .lifecycle import Operation
from .progress import observation


@dataclass(frozen=True)
class Tool:
    name: str
    description: str
    parameters: Contract
    returns: Contract
    handler: object
    authorize: object = None
    version: str = "1"
    timeout: float = 5
    max_bytes: int = 32768
    read_only: bool = True
    concurrent_safe: bool = False
    cancellation: str = "cooperative"
    resource: str = "none"
    cost: str = "local"

    def __post_init__(self):
        if (not re.fullmatch(r"[a-z][a-z0-9_.]{0,47}", self.name)
                or not self.description or not callable(self.handler)
                or not isinstance(self.parameters, Contract) or not isinstance(self.returns, Contract)
                or (self.authorize is not None and not callable(self.authorize))
                or not 0 < self.timeout <= 90 or type(self.max_bytes) is not int or not 0 < self.max_bytes <= 65536
                or type(self.read_only) is not bool or type(self.concurrent_safe) is not bool
                or self.cancellation not in ("cooperative", "wait_only")
                or self.resource not in ("none", "knowledge", "source", "skill", "agent")
                or self.cost not in ("local", "model", "mixed")):
            raise ValueError("Invalid tool definition")

    @property
    def wire_name(self):
        # Provider function names do not accept dots. Reject alias collisions at registration.
        return self.name.replace(".", "__")


class Tools:
    def __init__(self, tools=(), hooks=None):
        self._tools = {}
        self._wire = {}
        self._gates = {}
        self.hooks = hooks or Hooks()
        self.calls = Calls()
        for tool in tools:
            self.register(tool)

    def register(self, tool):
        if tool.name in self._tools or tool.wire_name in self._wire:
            raise ValueError("Duplicate tool identity")
        self._tools[tool.name] = tool
        self._wire[tool.wire_name] = tool.name
        self._gates[tool.name] = None if tool.concurrent_safe else threading.Lock()

    def discover(self, package_name, services):
        """Called only by trusted assembly with a fixed deployment package name."""
        package = importlib.import_module(package_name)
        for info in sorted(pkgutil.iter_modules(package.__path__), key=lambda item: item.name):
            if info.name.startswith("_") or info.ispkg:
                continue
            module = importlib.import_module(f"{package_name}.{info.name}")
            factory = getattr(module, "build_tools", None)
            if factory is not None:
                for tool in factory(services):
                    self.register(tool)

    def definitions(self, context):
        return [{"type": "function", "function": {
            "name": tool.wire_name, "description": tool.description, "parameters": tool.parameters.schema,
        }} for tool in self.snapshot(context).values() if self.visible(tool.name, context)]

    def snapshot(self, context):
        with context.state.lock:
            if context.state.tool_registry is None:
                context.state.tool_registry = dict(self._tools)
            return context.state.tool_registry

    def visible(self, name, context):
        return (name in self.snapshot(context) and name in context.policy.tools
                and (context.state.tool_ceiling is None or name in context.state.tool_ceiling))

    def canonical(self, wire_name):
        return self._wire.get(wire_name, "")

    def _authorize(self, tool, arguments, context):
        context.check()
        if (tool.name not in context.policy.tools
                or (context.state.tool_ceiling is not None and tool.name not in context.state.tool_ceiling)):
            raise RuntimeFault("tool_denied")
        validated = tool.parameters.validate(arguments, tool.max_bytes)
        if tool.authorize is not None:
            tool.authorize(context, validated)
        return validated

    def execute(self, name, arguments, context, call_id):
        # Attempts, including malformed/duplicate calls, consume steps to bound loops.
        safe_id = call_id if isinstance(call_id, str) and 1 <= len(call_id) <= 128 else "invalid"
        try:
            context.budget.reserve(context.deadline, tool_calls=1)
            if safe_id == "invalid" and call_id != "invalid":
                raise RuntimeFault("invalid_call_id")
            authority = {key: sorted(getattr(context.policy, key))
                         for key in ("tools", "skills", "scopes", "egress_scopes", "agents")}
            authority.update(actor=context.actor, audience=context.audience, session=context.session,
                             agent=context.agent_id, external_model=context.external_model,
                             policy=context.policy.version,
                             ceiling=sorted(context.state.tool_ceiling) if context.state.tool_ceiling is not None else None)
            fingerprint = json_text([name, arguments, authority], 65536)
        except RuntimeFault as error:
            try:
                with Operation(self.hooks, context, "tool", tool="unknown", call_id=safe_id):
                    raise error
            except RuntimeFault:
                if error.status in ("incomplete", "cancelled"):
                    raise
                return {"ok": False, "error": error.code, "call_id": safe_id, "recoverable": True}
        with context.state.tool_lock:
            previous = context.state.calls.get(call_id)
            if previous is not None:
                if previous[0] != fingerprint:
                    return {"ok": False, "error": "call_id_conflict", "call_id": call_id, "recoverable": True}
                if previous[1].get("status") in ("incomplete", "cancelled"):
                    raise RuntimeFault(previous[1]["error"], previous[1]["status"])
                return parse_json(json_text(previous[1], 65536), 65536)
            tool = self.snapshot(context).get(name)
            fault = None
            args = arguments
            try:
                with Operation(self.hooks, context, "tool", tool=tool.name if tool else "unknown", call_id=call_id) as op:
                    if tool is None:
                        raise RuntimeFault("unknown_tool")
                    args = parse_json(arguments, tool.max_bytes) if isinstance(arguments, str) else arguments
                    args = self._authorize(tool, args, context)
                    changed = op.before({"arguments": args})
                    args = self._authorize(tool, changed["arguments"], context)
                    bounded = replace(context, deadline=min(context.deadline, time.monotonic() + tool.timeout))
                    try:
                        result = self.calls.invoke(lambda: tool.handler(bounded, args), bounded, op.start,
                                                   self._gates[tool.name])
                    except RuntimeFault as error:
                        if error.code == "deadline" and time.monotonic() < context.deadline:
                            raise RuntimeFault("tool_timeout", "incomplete") from None
                        raise
                    result = tool.returns.validate(result, tool.max_bytes)
                    reply = {"ok": True, "value": result, "call_id": call_id}
                    encoded = json_text(reply, 65536)
                    context.budget.reserve(context.deadline, total_bytes=len(encoded.encode("utf-8")))
                    op.data = {"result": result}
                    evidence_updates = {}
                    if isinstance(result, dict):
                        records = result.get("evidence", [])
                        if not isinstance(records, list):
                            raise RuntimeFault("invalid_evidence")
                        for evidence in records:
                            if not isinstance(evidence, dict) or not isinstance(evidence.get("id"), str):
                                raise RuntimeFault("invalid_evidence")
                            old = evidence_updates.get(evidence["id"], context.state.evidence.get(evidence["id"]))
                            if old is not None and old != evidence:
                                raise RuntimeFault("evidence_conflict")
                            evidence_updates[evidence["id"]] = evidence
                context.check()
                context.state.evidence.update(evidence_updates)
            except RuntimeFault as error:
                fault = error
                reply = {"ok": False, "error": error.code, "call_id": call_id,
                         "status": error.status, "recoverable": error.status not in ("incomplete", "cancelled")}
            except Exception:
                reply = {"ok": False, "error": "tool_failed", "call_id": call_id, "recoverable": True}
            context.state.calls[call_id] = (fingerprint, reply)
            context.state.tool_observations[call_id] = observation(name, args, reply)
            if fault is not None and fault.status in ("incomplete", "cancelled"):
                raise fault
            return parse_json(json_text(reply, 65536), 65536)
