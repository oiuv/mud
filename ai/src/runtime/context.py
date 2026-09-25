"""Immutable authority and request-local, shared resource accounting."""
import math
import threading
import time
import uuid
from dataclasses import dataclass, field, replace

from .contracts import RuntimeFault


@dataclass(frozen=True)
class Limits:
    model_calls: int = 12
    external_calls: int = 36
    tool_calls: int = 48
    delegations: int = 4
    total_bytes: int = 1048576
    context_bytes: int = 131072
    output_bytes: int = 32768
    depth: int = 1

    def __post_init__(self):
        for name, value in vars(self).items():
            if type(value) is not int or value < 0 or (name in ("context_bytes", "output_bytes") and value == 0):
                raise ValueError(f"Invalid limit: {name}")


class Budget:
    """Children have local caps and atomically debit every ancestor's counters."""
    def __init__(self, limits=None, parent=None):
        self.limits = limits or Limits()
        self.parent = parent
        self.lock = parent.lock if parent else threading.RLock()
        self.cancelled = parent.cancelled if parent else threading.Event()
        self.counts = {key: 0 for key in ("model_calls", "external_calls", "tool_calls", "delegations", "total_bytes")}
        self.usage = {key: 0 for key in ("prompt_tokens", "completion_tokens", "total_tokens")}

    def check(self, deadline):
        if self.cancelled.is_set():
            raise RuntimeFault("cancelled", "cancelled")
        if time.monotonic() >= deadline:
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
                    if budget.counts[key] + amount > getattr(budget.limits, key):
                        raise RuntimeFault("budget_exhausted", "incomplete")
            for budget in chain:
                for key, amount in amounts.items():
                    budget.counts[key] += amount

    def record_usage(self, usage):
        with self.lock:
            budget = self
            while budget:
                for key in budget.usage:
                    value = usage.get(key, 0)
                    if type(value) is int and value >= 0:
                        budget.usage[key] += value
                budget = budget.parent

    def snapshot(self):
        with self.lock:
            return {**self.counts, "usage": dict(self.usage)}


@dataclass(frozen=True)
class Policy:
    tools: frozenset = frozenset()
    skills: frozenset = frozenset()
    scopes: frozenset = frozenset()
    egress_scopes: frozenset = frozenset()
    agents: frozenset = frozenset()
    version: str = "default-deny-v1"

    def __post_init__(self):
        for key in ("tools", "skills", "scopes", "egress_scopes", "agents"):
            if not isinstance(getattr(self, key), (set, frozenset, tuple, list)):
                raise ValueError("Policy identifiers must be a collection")
            values = frozenset(getattr(self, key))
            if any(not isinstance(value, str) or not value or len(value) > 128 for value in values):
                raise ValueError("Invalid policy identifiers")
            object.__setattr__(self, key, values)

    def intersect(self, other):
        return Policy(**{key: getattr(self, key) & getattr(other, key)
                         for key in ("tools", "skills", "scopes", "egress_scopes", "agents")},
                      version=self.version)


@dataclass
class RunState:
    """Visible task evidence, not private model reasoning. Never handed to hooks."""
    goal: str = ""
    facts: list = field(default_factory=list)
    pending: list = field(default_factory=list)
    evidence: dict = field(default_factory=dict)
    calls: dict = field(default_factory=dict)
    skills: dict = field(default_factory=dict)
    skill_catalog: object = None
    tool_registry: object = None
    tool_ceiling: object = None
    lock: object = field(default_factory=threading.RLock)
    tool_lock: object = field(default_factory=threading.RLock)
    lifecycle_lock: object = field(default_factory=threading.RLock)
    terminal: object = None
    pending_commit: object = None


@dataclass(frozen=True)
class RunContext:
    request_id: str
    actor: str
    audience: str
    session: str
    policy: Policy
    deadline: float
    budget: Budget = field(default_factory=Budget)
    external_model: bool = True
    run_id: str = field(default_factory=lambda: uuid.uuid4().hex)
    root_id: str = ""
    parent_id: str = ""
    agent_id: str = ""
    ancestors: tuple = ()
    delegation_depth: int = 0
    state: RunState = field(default_factory=RunState, compare=False)

    def __post_init__(self):
        if (type(self.deadline) not in (int, float) or not math.isfinite(self.deadline)
                or self.audience not in ("player", "admin", "internal")):
            raise ValueError("Invalid trusted run context")
        if not self.root_id:
            object.__setattr__(self, "root_id", self.run_id)

    def check(self):
        self.budget.check(self.deadline)

    def enter(self, agent_id, policy, limits, *, delegated=False):
        self.check()
        if agent_id not in self.policy.agents or agent_id in self.ancestors:
            raise RuntimeFault("agent_denied")
        depth = self.delegation_depth + int(delegated)
        if depth > self.budget.limits.depth:
            raise RuntimeFault("delegation_depth", "incomplete")
        if delegated:
            self.budget.reserve(self.deadline, delegations=1)
        return replace(self, agent_id=agent_id, policy=self.policy.intersect(policy),
                       budget=Budget(limits, self.budget), parent_id=self.run_id,
                       run_id=uuid.uuid4().hex, ancestors=(*self.ancestors, agent_id),
                       delegation_depth=depth, state=RunState())
