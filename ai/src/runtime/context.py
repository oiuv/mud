"""Immutable authority and request-local, shared resource accounting."""
import hashlib
import json
import math
from fnmatch import fnmatchcase
import threading
import time
import uuid
from dataclasses import dataclass, field, replace

from .contracts import RuntimeFault
from .window import TokenMeter
from .usage import TOKEN_FIELDS, normalize_usage, usage_known
from .results import Results


@dataclass(frozen=True)
class Limits:
    # Count fields are accepted for old deployment definitions, but are not
    # termination limits. Payload size and delegation topology remain enforced.
    model_calls: int = 12
    external_calls: int = 36
    tool_calls: int = 48
    delegations: int = 4
    input_bytes: int = 131072
    output_bytes: int = 32768
    depth: int = 1

    def __post_init__(self):
        for name, value in vars(self).items():
            if type(value) is not int or value < 0 or (name in ("input_bytes", "output_bytes") and value == 0):
                raise ValueError(f"Invalid limit: {name}")


class Budget:
    """Request-local usage ledger; legacy count fields no longer cap execution."""
    def __init__(self, limits=None, parent=None, *, alive=None):
        self.limits = limits or Limits()
        self.parent = parent
        self.lock = parent.lock if parent else threading.RLock()
        self.cancelled = parent.cancelled if parent else threading.Event()
        self.alive = parent.alive if parent else alive
        self.counts = {key: 0 for key in ("model_calls", "external_calls", "tool_calls", "delegations", "total_bytes")}
        self.usage = dict.fromkeys(TOKEN_FIELDS, 0)
        self.usage_unknown = dict.fromkeys(TOKEN_FIELDS, 0)
        self.usage_groups = {}
        self.usage_reports = 0
        self.usage_incomplete_reports = 0

    def check(self, deadline):
        if self.alive is not None and not self.alive():
            self.cancelled.set()
        if self.cancelled.is_set():
            raise RuntimeFault("cancelled", "cancelled")
        if deadline is not None and time.monotonic() >= deadline:
            raise RuntimeFault("deadline", "incomplete")

    def reserve(self, deadline, **amounts):
        with self.lock:
            self.check(deadline)
            chain = []
            budget = self
            while budget:
                chain.append(budget)
                budget = budget.parent
            for key, amount in amounts.items():
                if key not in self.counts or type(amount) is not int or amount < 0:
                    raise ValueError("Invalid budget reservation")
            for budget in chain:
                for key, amount in amounts.items():
                    budget.counts[key] += amount

    def record_usage(self, usage, *, model="unknown", kind="chat", operation="unknown",
                     agent="", role="primary", status="completed"):
        usage = normalize_usage(usage, kind)
        labels = dict(model=model, kind=kind, operation=operation, agent=agent, role=role)
        group_key = tuple(labels.values())
        with self.lock:
            budget = self
            while budget:
                budget.usage_reports += 1
                if not usage_known(usage):
                    budget.usage_incomplete_reports += 1
                group = budget.usage_groups.setdefault(group_key, {
                    **labels, "calls": 0, "statuses": {}, "usage": dict.fromkeys(TOKEN_FIELDS, 0),
                    "unknown": dict.fromkeys(TOKEN_FIELDS, 0)})
                group["calls"] += 1
                group["statuses"][status] = group["statuses"].get(status, 0) + 1
                for key in budget.usage:
                    if key in usage:
                        budget.usage[key] += usage[key]
                        group["usage"][key] += usage[key]
                    else:
                        budget.usage_unknown[key] += 1
                        group["unknown"][key] += 1
                budget = budget.parent

    def snapshot(self, *, detail=True):
        with self.lock:
            result = {**self.counts, "usage": dict(self.usage), "usage_reports": self.usage_reports,
                      "usage_incomplete_reports": self.usage_incomplete_reports,
                      "usage_unknown": dict(self.usage_unknown)}
            if detail:
                result["usage_groups"] = [
                    {**group, "usage": dict(group["usage"]), "unknown": dict(group["unknown"]),
                     "statuses": dict(group["statuses"])} for group in self.usage_groups.values()]
            return result

    def remaining(self):
        """Deprecated legacy count headroom; never used to control execution."""
        with self.lock:
            remaining = {key: getattr(self.limits, key) - count for key, count in self.counts.items()
                         if key != "total_bytes"}
            parent = self.parent
            while parent:
                for key in remaining:
                    remaining[key] = min(remaining[key], getattr(parent.limits, key) - parent.counts[key])
                parent = parent.parent
            return remaining


@dataclass(frozen=True)
class Policy:
    tools: frozenset = frozenset()
    skills: frozenset = frozenset()
    scopes: frozenset = frozenset()
    egress_scopes: frozenset = frozenset()
    agents: frozenset = frozenset()
    version: str = "default-deny-v1"
    # AND between restriction layers, OR within each layer. No layers means no
    # additional filter; an empty layer denies all documents.
    knowledge_paths: tuple = ()

    def __post_init__(self):
        if not isinstance(self.version, str) or not self.version or len(self.version) > 128:
            raise ValueError("Invalid policy version")
        for key in ("tools", "skills", "scopes", "egress_scopes", "agents"):
            if not isinstance(getattr(self, key), (set, frozenset, tuple, list)):
                raise ValueError("Policy identifiers must be a collection")
            values = frozenset(getattr(self, key))
            if any(not isinstance(value, str) or not value or len(value) > 128 for value in values):
                raise ValueError("Invalid policy identifiers")
            object.__setattr__(self, key, values)
        layers = []
        if not isinstance(self.knowledge_paths, (list, tuple)):
            raise ValueError("Invalid knowledge path restrictions")
        for patterns in self.knowledge_paths:
            if not isinstance(patterns, (list, tuple)) or len(patterns) > 128:
                raise ValueError("Invalid knowledge path restrictions")
            for pattern in patterns:
                if (not isinstance(pattern, str) or not pattern or len(pattern) > 256
                        or any(char in pattern for char in ("\\", ":", "\x00"))
                        or pattern.startswith("/") or ".." in pattern.split("/")):
                    raise ValueError("Knowledge patterns must be relative public paths")
            layers.append(tuple(sorted(set(patterns))))
        object.__setattr__(self, "knowledge_paths", tuple(sorted(set(layers))))

    def intersect(self, other):
        return Policy(**{key: getattr(self, key) & getattr(other, key)
                         for key in ("tools", "skills", "scopes", "egress_scopes", "agents")},
                      knowledge_paths=(*self.knowledge_paths, *other.knowledge_paths),
                      version=self.version if self.version == other.version else hashlib.sha256(
                          json.dumps(sorted((self.version, other.version))).encode()).hexdigest())

    def restrict(self, values):
        """Trusted deployment configuration can only narrow existing grants."""
        keys = ("tools", "skills", "scopes", "egress_scopes", "agents")
        if not isinstance(values, dict) or set(values) - {*keys, "version", "knowledge_paths"}:
            raise ValueError("Invalid runtime policy fields")
        ceiling = Policy(**{key: values.get(key, getattr(self, key)) for key in keys},
                         version=values.get("version", self.version),
                         knowledge_paths=(values["knowledge_paths"],) if "knowledge_paths" in values else ())
        return self.intersect(ceiling)

    def permits_knowledge(self, path):
        return all(any(fnmatchcase(path, pattern) for pattern in patterns)
                   for patterns in self.knowledge_paths)

    def fingerprint(self):
        values = {key: sorted(getattr(self, key)) for key in
                  ("tools", "skills", "scopes", "egress_scopes", "agents")}
        values.update(version=self.version, knowledge_paths=self.knowledge_paths)
        return hashlib.sha256(json.dumps(values, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()


@dataclass
class RunState:
    """Visible task evidence, not private model reasoning. Never handed to hooks."""
    goal: str = ""
    facts: list = field(default_factory=list)
    pending: list = field(default_factory=list)
    evidence: dict = field(default_factory=dict)
    calls: dict = field(default_factory=dict)
    tool_observations: dict = field(default_factory=dict)
    skills: dict = field(default_factory=dict)
    skill_catalog: object = None
    tool_registry: object = None
    tool_ceiling: object = None
    lock: object = field(default_factory=threading.RLock)
    tool_lock: object = field(default_factory=threading.RLock)
    delegation_lock: object = field(default_factory=threading.Lock)
    lifecycle_lock: object = field(default_factory=threading.RLock)
    terminal: object = None
    terminal_digest: str = ""
    pending_commit: object = None
    token_meter: object = field(default_factory=TokenMeter)
    compactions: list = field(default_factory=list)
    result_refs: dict = field(default_factory=dict)
    receipts: dict = field(default_factory=dict)


@dataclass(frozen=True)
class RunContext:
    request_id: str
    actor: str
    audience: str
    session: str
    policy: Policy
    # Only a short request or a single operation has a fixed deadline.
    deadline: float | None
    budget: Budget = field(default_factory=Budget)
    external_model: bool = True
    run_id: str = field(default_factory=lambda: uuid.uuid4().hex)
    root_id: str = ""
    parent_id: str = ""
    agent_id: str = ""
    ancestors: tuple = ()
    delegation_depth: int = 0
    state: RunState = field(default_factory=RunState, compare=False)
    results: object = field(default_factory=Results, compare=False)

    def __post_init__(self):
        if ((self.deadline is not None and (type(self.deadline) not in (int, float) or not math.isfinite(self.deadline)))
                or self.audience not in ("player", "admin", "internal")):
            raise ValueError("Invalid trusted run context")
        if not self.root_id:
            object.__setattr__(self, "root_id", self.run_id)

    def check(self):
        self.budget.check(self.deadline)

    def remaining(self, seconds):
        return seconds if self.deadline is None else min(seconds, max(0, self.deadline - time.monotonic()))

    def bounded(self, seconds):
        return replace(self, deadline=time.monotonic() + self.remaining(seconds))

    def enter(self, agent_id, policy, limits, *, delegated=False):
        self.check()
        if agent_id not in self.policy.agents or agent_id in self.ancestors:
            raise RuntimeFault("agent_denied")
        depth = self.delegation_depth + int(delegated)
        # A leaf may forbid *further* delegation (depth=0) while already running
        # inside an admitted child task. Ordinary Agent/summary entry adds no depth.
        if delegated and (self.delegation_depth >= 1 or depth > self.budget.limits.depth):
            raise RuntimeFault("delegation_depth", "incomplete")
        if delegated:
            self.budget.reserve(self.deadline, delegations=1)
        return replace(self, agent_id=agent_id, policy=self.policy.intersect(policy),
                       budget=Budget(limits, self.budget), parent_id=self.run_id,
                       run_id=uuid.uuid4().hex, ancestors=(*self.ancestors, agent_id),
                       delegation_depth=depth, state=RunState())
