"""OS-authorized source investigation, no socket route, player DB or game state."""
import uuid
import time
from dataclasses import replace

from .llm import ChatModel, create_chat_client
from .npc.agents import build_agents
from .npc.investigation import source_policy
from .npc.presentation import present_result
from .runtime.context import Policy, RunContext
from .runtime.contracts import RuntimeFault
from .runtime.hooks import Hooks
from .runtime.runner import Runner
from .runtime.skills import Skills
from .runtime.tools import Tools
from .source_config import load_sources
from .usage_report import usage_report


def diagnose_source(settings, question, *, audience="player", client=None, hooks=None):
    """Local diagnostic view; all audiences share one repository boundary.

    Reuse the NPC rule Agent and Skill/Tool/verification chain, with no storage
    commit because this entry does not converse with an actual player.
    """
    if audience not in ("player", "admin"):
        raise RuntimeFault("audience_denied")
    sources = load_sources(settings)
    base = Policy(tools={"skill"}, skills={"npc-dialogue"}, agents={"npc_dialogue"},
                  version="local-source-diagnostic-v1")
    policy = source_policy(base, sources).restrict(settings.runtime_policy)
    if not sources.scopes or not set(sources.scopes) <= policy.scopes or not {"source.read", "source.search"} <= policy.tools:
        raise RuntimeFault("scope_denied")
    if not set(sources.scopes) <= policy.egress_scopes:
        raise RuntimeFault("egress_denied")
    hooks = hooks or Hooks()
    skills = Skills(settings.skills_dir)
    tools = Tools(hooks=hooks)
    tools.discover(__package__ + ".tools", {"skills": skills, "sources": sources, "settings": settings})
    definition = next(build_agents(settings, tools=tools, policy=policy))
    def verify(result, context):
        value = result.value
        if result.status == "completed" and (value["kind"] != "rules" or "investigation" not in value):
            return ("source_investigation_required",)
        return definition.verify(result, context)
    agent = replace(definition, verify=verify, requires_commit=False,
                    required_skills=("npc-dialogue", "source-investigation"))
    root = RunContext(uuid.uuid4().hex, "local-cli", audience, "source-diagnostic", policy, None)
    owns_client = client is None
    client = create_chat_client(settings) if owns_client else client
    if client is None:
        raise RuntimeFault("model_unconfigured")
    started = time.monotonic()
    compactions = []
    try:
        runner = Runner(ChatModel(settings, client), [agent], tools, hooks, skills)
        outcome = runner.run(agent.name, {
            "role": {"name": "问学先生", "role": "据已查明的门规武学指点问学者"},
            "player_name": "问学者", "message": question, "memory": {}, "history": [], "situation": "静室问学",
        }, root)
        view = present_result(outcome, sources)
        compactions = outcome.context.state.compactions
    except KeyboardInterrupt:
        view = {"status": "cancelled", "answer": "问学先生说：少侠既有他事，便改日再谈。"}
    finally:
        root.budget.cancelled.set()
        if owns_client:
            client.close()
    return {**view, "audience": root.audience, "question": question, "scopes": sorted(policy.scopes),
            "model": settings.chat_model, "ledger": root.budget.snapshot(), "compactions": compactions,
            "source_access": {"mode": "repository", "policy_version": "repository-source-v2",
                              "fingerprint": sources.fingerprint(sources.scopes)},
            "elapsed_s": round(time.monotonic() - started, 3),
            "cost": usage_report(root.budget.snapshot(), settings.model_prices_per_million,
                                 settings.cost_currency), "human_review_required": True}
