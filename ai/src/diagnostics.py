"""Trusted local CLI entries. Not registered on the network or visible to models."""
import time
import uuid

from .llm import ChatModel
from .runtime.context import Budget, Limits, Policy, RunContext
from .runtime.contracts import Contract, RuntimeFault
from .runtime.hooks import Hooks
from .runtime.runner import Agent, Runner
from .runtime.tools import Tools
from .tools.knowledge import knowledge_tool


def diagnose_text(settings, client, question, *, hooks=None):
    """One bounded model request, no NPC context, storage, skills or tools."""
    policy = Policy(agents={"diagnostic_chat"}, version="local-chat-diagnostic-v1")
    limits = Limits(model_calls=1, external_calls=1, tool_calls=0, delegations=0, depth=0)
    agent = Agent(
        "diagnostic_chat", "检查已配置模型的连通性",
        Contract({"type": "string", "minLength": 1, "maxLength": settings.max_message_chars}),
        Contract({"type": "string", "minLength": 1}),
        lambda context, payload: [{"role": "user", "content": payload}], policy,
        lambda result, context: [], limits=limits, mode="single", operation="diagnostic_chat",
        timeout=min(settings.chat_timeout, 300), max_tokens=settings.max_tokens)
    context = RunContext(uuid.uuid4().hex, "local-cli", "admin", "diagnostic-chat", policy,
                         time.monotonic() + settings.request_timeout, Budget(limits))
    return Runner(ChatModel(settings, client), [agent], hooks=hooks).run(agent.name, question, context)


class RetrievalDiagnostic:
    """Programmatic calls use exactly the same executor as model-selected tools.

    Each query has one tool step and at most two remote operations. A caller can
    additionally supply a shared batch budget/deadline (e.g. a cache benchmark).
    Local diagnostics may show bounded scores; they do not grant private scopes.
    """
    def __init__(self, knowledge, *, mode="hybrid", hooks=None, budget=None, deadline=None):
        self.settings = knowledge.settings
        self.remote = mode != "bm25"
        self.hooks = hooks or Hooks()
        self.budget, self.deadline = budget, deadline
        self.limits = Limits(model_calls=0, external_calls=2 if self.remote else 0,
                             tool_calls=1, delegations=0, depth=0)
        self.policy = Policy(tools={"knowledge.search"}, scopes={"knowledge"},
                             egress_scopes={"knowledge"} if self.remote else set(),
                             version="local-retrieval-diagnostic-v1")
        self.tools = Tools([knowledge_tool(knowledge, self.hooks, diagnostic=True, mode=mode)],
                           hooks=self.hooks)

    def search(self, query, limit=None, threshold=.4):
        deadline = time.monotonic() + self.settings.request_timeout
        if self.deadline is not None:
            deadline = min(deadline, self.deadline)
        context = RunContext(uuid.uuid4().hex, "local-cli", "admin", "diagnostic-retrieval",
                             self.policy, deadline, Budget(self.limits, self.budget),
                             external_model=self.remote, agent_id="diagnostic_retrieval")
        status, code = "failed", "diagnostic_failed"
        try:
            context.check()
            self.hooks.emit("run_start", context)
            reply = self.tools.execute("knowledge.search", {
                "query": query, "limit": self.settings.retrieval_top_k if limit is None else limit,
                "threshold": threshold}, context, "query")
            if not reply["ok"]:
                raise RuntimeFault(reply["error"], reply.get("status", "failed"))
            context.check()
            status, code = "completed", ""
            return reply["value"], context
        except RuntimeFault as error:
            status, code = error.status, error.code
            raise
        finally:
            if status == "failed":
                self.hooks.emit("run_error", context, status=status, code=code)
            self.hooks.emit("run_end", context, status=status, code=code, budget=context.budget.snapshot())
