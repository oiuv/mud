"""Goal-driven loop. Business modules supply prompts and completion criteria."""
import logging
import re
from dataclasses import dataclass, field, replace

from ..llm import ModelUnavailable
from .context import Limits, Policy
from .contracts import Contract, RuntimeFault, json_text
from .hooks import Hooks
from .lifecycle import error_code
from .model import call_model
from .tools import Tools

logger = logging.getLogger(__name__)
STATUSES = frozenset(("completed", "needs_input", "incomplete", "failed", "cancelled"))


@dataclass(frozen=True)
class Result:
    status: str
    value: object = None
    code: str = ""

    def __post_init__(self):
        if self.status not in STATUSES:
            raise ValueError("Invalid result status")


def text_result(text):
    return Result("completed", text)


@dataclass(frozen=True)
class Agent:
    name: str
    description: str
    inputs: Contract
    outputs: Contract
    messages: object
    policy: Policy
    verify: object
    parse: object = text_result
    limits: Limits = field(default_factory=Limits)
    mode: str = "tool_loop"
    operation: str = "agent"
    timeout: float = 60
    max_tokens: int = 2048
    required_skills: tuple = ()
    requires_commit: bool = False

    def __post_init__(self):
        if (not re.fullmatch(r"[a-z][a-z0-9_]{0,63}", self.name) or not self.description
                or self.mode not in ("single", "tool_loop") or not callable(self.messages)
                or not callable(self.verify) or not callable(self.parse)
                or not isinstance(self.inputs, Contract) or not isinstance(self.outputs, Contract)
                or not isinstance(self.policy, Policy) or not isinstance(self.limits, Limits)
                or not 0 < self.timeout <= 300 or type(self.max_tokens) is not int or self.max_tokens <= 0
                or type(self.requires_commit) is not bool
                or not isinstance(self.required_skills, tuple)
                or any(not isinstance(name, str) or not re.fullmatch(r"[a-z][a-z0-9-]{0,47}", name)
                       for name in self.required_skills)):
            raise ValueError("Invalid Agent definition")


@dataclass(frozen=True)
class Outcome:
    result: Result
    context: object
    agent: object

    @property
    def finalized(self):
        return self.context.state.terminal is not None


class Runner:
    def __init__(self, model, agents=(), tools=None, hooks=None, skills=None):
        self.model = model
        self.hooks = hooks or Hooks()
        self.tools = tools or Tools(hooks=self.hooks)
        self.tools.hooks = self.hooks
        self.skills = skills
        self.agents = {}
        for agent in agents:
            self.register(agent)

    def register(self, agent):
        if agent.name in self.agents:
            raise ValueError("Duplicate Agent")
        self.agents[agent.name] = agent

    def _messages(self, messages, context):
        if not isinstance(messages, list) or not messages:
            raise RuntimeFault("invalid_messages")
        for message in messages:
            if (not isinstance(message, dict)
                    or message.get("role") not in ("system", "user", "assistant", "tool")
                    or (message.get("content") is not None and not isinstance(message["content"], str))):
                raise RuntimeFault("invalid_messages")
        encoded = json_text(messages, context.budget.limits.context_bytes)
        return len(encoded.encode("utf-8"))

    def _finish(self, result, context, agent):
        with context.state.lifecycle_lock:
            if context.state.terminal is not None:
                return Outcome(context.state.terminal, context, agent)
            context.state.terminal = result
            context.state.pending_commit = None
            events = ("run_error", "run_end") if result.status == "failed" else ("run_end",)
            for event in events:
                try:
                    self.hooks.emit(event, context, status=result.status, code=result.code,
                                    budget=context.budget.snapshot())
                except Exception:
                    # Settlement is final; diagnostics must never repeat a business action.
                    logger.warning("Terminal observation failed: event=%s", event)
        return Outcome(result, context, agent)

    def _preload(self, agent, context):
        messages = []
        if agent.required_skills and self.skills is None:
            raise RuntimeFault("skill_unavailable")
        for index, name in enumerate(agent.required_skills):
            reply = self.tools.execute("skill", {"name": name}, context, f"preload-{index}")
            if not reply["ok"]:
                raise RuntimeFault(reply["error"])
            messages.append({"role": "system", "content": "已加载专业指导：" + json_text(reply["value"], 65536)})
        return messages

    def run(self, name, payload, context, *, delegated=False):
        agent = self.agents.get(name)
        try:
            if agent is None:
                raise RuntimeFault("unknown_agent")
            context = context.enter(agent.name, agent.policy, agent.limits, delegated=delegated)
            payload = agent.inputs.validate(payload, context.budget.limits.context_bytes)
            context.state.goal = payload.get("goal", "") if isinstance(payload, dict) else str(payload)
            self.hooks.emit("run_start", context)
            messages = agent.messages(context, payload)
            self._messages(messages, context)
            messages = list(messages) + self._preload(agent, context)
            while True:
                context.check()
                catalog = (self.skills.catalog_message(context)
                           if self.skills and agent.mode == "tool_loop" and self.tools.visible("skill", context)
                           else None)
                request_messages = ([catalog] if catalog else []) + messages
                definitions = self.tools.definitions(context) if agent.mode == "tool_loop" else []
                response = call_model(self.model, request_messages, definitions, agent, context, self.hooks, self._messages)
                if response.tool_calls:
                    if agent.mode != "tool_loop":
                        raise RuntimeFault("unexpected_tool_calls")
                    messages.append({"role": "assistant", "content": response.text or None, "tool_calls": [
                        {"id": call.id, "type": "function", "function": {
                            "name": call.name, "arguments": call.arguments}} for call in response.tool_calls]})
                    for call in response.tool_calls:
                        result = self.tools.execute(self.tools.canonical(call.name), call.arguments, context, call.id)
                        messages.append({"role": "tool", "tool_call_id": call.id, "content": json_text(result, 65536)})
                    continue
                gaps = ()
                try:
                    result = agent.parse(response.text)
                    if not isinstance(result, Result):
                        raise RuntimeFault("invalid_result")
                    value = agent.outputs.validate(result.value, context.budget.limits.output_bytes)
                    result = replace(result, value=value)
                    gaps = tuple(agent.verify(result, context.state))
                except RuntimeFault as error:
                    gaps = (error.code,)
                except (ValueError, TypeError):
                    gaps = ("invalid_result",)
                if not gaps:
                    context.check()
                    if result.status == "completed" and agent.requires_commit:
                        outcome = Outcome(result, context, agent)
                        context.state.pending_commit = (outcome, self, json_text(result.value))
                        return outcome
                    return self._finish(result, context, agent)
                if agent.mode == "single":
                    raise RuntimeFault("completion_incomplete", "incomplete")
                context.state.pending = list(gaps)
                messages.extend([{"role": "assistant", "content": response.text}, {"role": "user", "content":
                    "结果尚未满足完成条件。请在现有授权和预算内补查并核对；确有阻碍则明确说明。缺口："
                    + json_text(list(gaps), 8192)}])
        except RuntimeFault as error:
            return self._finish(Result(error.status, code=error.code), context, agent)
        except ModelUnavailable as error:
            return self._finish(Result("failed", code=error_code(error)), context, agent)
        except Exception as error:
            logger.warning("Agent failed: error=%s", type(error).__name__)
            return self._finish(Result("failed", code="internal_error"), context, agent)

    def commit(self, outcome, callback):
        """Trusted business callback must still verify its session/task identity."""
        context, agent, result = outcome.context, outcome.agent, outcome.result
        with context.state.lifecycle_lock:
            pending = context.state.pending_commit
            if context.state.terminal is not None or pending is None or pending[0] is not outcome or pending[1] is not self:
                raise RuntimeFault("not_pending_commit")
            context.state.pending_commit = None
            try:
                context.check()
                if json_text(result.value) != pending[2]:
                    raise RuntimeFault("candidate_changed")
                self.hooks.emit("before_commit", context, {"result": result.value})
                value = agent.outputs.validate(result.value, context.budget.limits.output_bytes)
                if tuple(agent.verify(replace(result, value=value), context.state)):
                    raise RuntimeFault("completion_incomplete", "incomplete")
                context.check()
                committed = callback(value)
            except Exception as error:
                fault = error if isinstance(error, RuntimeFault) else RuntimeFault("commit_failed")
                self._finish(Result(fault.status, code=error_code(fault)), context, agent)
                raise fault from None
            # Once committed, cancellation/observation cannot rewrite durable success.
            self._finish(result, context, agent)
            return committed
