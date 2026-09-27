"""Opt-in goal coordinator. No replacement of existing explicit business routes."""
import json
import hashlib
import threading
from dataclasses import replace

from ..capacity import Capacity
from ..knowledge_qwen import QwenKnowledgeSystem
from ..llm import ChatModel, create_chat_client
from ..npc.agents import parse_reply
from ..npc.investigation import (INVESTIGATION, SOURCE_TOOLS, evidence_reference_feedback,
                                 source_policy, verify_investigation)
from ..npc.presentation import player_text_gaps
from ..protocol import MAX_DATAGRAM, error_response
from ..request_cache import RequestCache
from ..runtime.context import Budget, Limits, Policy, RunContext
from ..runtime.contracts import Contract, RuntimeFault, json_text
from ..runtime.delegation import Delegations
from ..runtime.hooks import Hooks
from ..runtime.runner import Agent, Runner
from ..runtime.skills import Skills
from ..runtime.tools import Tools
from ..source_config import load_sources


BASE = Policy(tools={"skill", "knowledge.search", "agent.list", "agent.invoke"},
              skills={"main-coordinator"}, scopes={"knowledge"}, egress_scopes={"knowledge"},
              agents={"main_router"}, version="main-player-v1")
REQUEST = Contract({"type": "object", "required": ["type", "request_id", "player_id", "goal"],
                    "additionalProperties": False, "properties": {
    "type": {"const": "agent_run"}, "request_id": {"type": "string", "minLength": 1, "maxLength": 128},
    "player_id": {"type": "string", "minLength": 1, "maxLength": 128},
    "npc_id": {"type": "string", "minLength": 1, "maxLength": 128},
    "goal": {"type": "string", "minLength": 1, "maxLength": 1000},
    "context": {"type": "object", "additionalProperties": False, "properties": {
        "situation": {"type": "string", "maxLength": 1600}, "world": {"type": "object"}}},
}})
OUTPUT = Contract({"type": "object", "required": ["status", "kind", "answer", "claims", "pending"],
                   "additionalProperties": False, "properties": {
    "status": {"enum": ["completed", "needs_input", "incomplete"]},
    "kind": {"enum": ["conversation", "rules"]},
    "answer": {"type": "string", "maxLength": 1600},
    "result_ref": {"type": "string", "pattern": "^result:[a-f0-9]{32}$"},
    "claims": {"type": "array", "maxItems": 20, "items": {
        "type": "object", "required": ["text", "evidence"], "additionalProperties": False,
        "properties": {"text": {"type": "string", "minLength": 1, "maxLength": 1600},
                       "evidence": {"type": "array", "maxItems": 10,
                                    "items": {"type": "string", "maxLength": 128}}}}},
    "investigation": INVESTIGATION,
    "pending": {"type": "array", "maxItems": 20, "items": {"type": "string", "maxLength": 500}},
}})


class RouterService:
    request_types = ("agent_run",)

    def __init__(self, settings, *, npc=None, world=None, model=None, knowledge=None, hooks=None):
        self.settings, self.npc, self.world = settings, npc, world
        self.capacity = Capacity(settings.main_agent_workers)
        self.hooks = hooks or Hooks()
        self._stop = threading.Event()
        self._requests = [threading.Lock() for _ in range(64)]
        self.cache = RequestCache(settings, "agent_run")
        self.skills = Skills(settings.skills_dir)
        self.sources = load_sources(settings)
        self.client = None
        self._owns_knowledge = knowledge is None and npc is None
        self.knowledge = knowledge if knowledge is not None else npc.npc.knowledge if npc is not None else QwenKnowledgeSystem(settings=settings)
        try:
            if model is None:
                self.client = create_chat_client(settings)
                model = ChatModel(settings, self.client)
            self.model = model
        except Exception:
            if self._owns_knowledge:
                self.knowledge.close()
            raise

    def context(self, request, deadline, lifetime):
        actor, npc_id = request["player_id"], request.get("npc_id")
        policy = source_policy(BASE, self.sources)
        if npc_id is not None:
            if self.npc is None or not self.npc.npc.get_npc_config(npc_id):
                raise RuntimeFault("session_denied")
            leaf = self.npc.npc.entry_policy(npc_id)
            # Session knowledge limits constrain both main and professional work.
            policy = replace(policy, tools=BASE.tools | leaf.tools, skills=BASE.skills | leaf.skills,
                             scopes=leaf.scopes, egress_scopes=leaf.egress_scopes,
                             agents=policy.agents | leaf.agents, knowledge_paths=leaf.knowledge_paths,
                             version=hashlib.sha256(json_text([
                                 policy.fingerprint(), leaf.fingerprint()]).encode("utf-8")).hexdigest())
        world = request.get("context", {}).get("world")
        if world is not None:
            if self.world is None:
                raise RuntimeFault("agent_denied")
            policy = replace(policy, agents=policy.agents | {"world_narration"}, skills=policy.skills | {"world-narration"})
        policy = policy.restrict(self.settings.runtime_policy)
        alive = lambda: not self._stop.is_set() and (lifetime is None or lifetime.alive())
        return RunContext(request["request_id"], actor, "player", json.dumps([npc_id or "main_router", actor]),
                          policy, deadline, Budget(Limits(), alive=alive))

    def assemble(self, request, context):
        delegates = []
        if "npc_id" in request:
            delegates.append(self.npc.delegation(original_goal=request["goal"],
                                                situation=request.get("context", {}).get("situation", "")))
        world = request.get("context", {}).get("world")
        if world is not None:
            delegates.append(self.world.delegation(world, request_id=context.request_id, actor=context.actor,
                                                  audience=context.audience, session=context.session))
        tools = Tools(hooks=self.hooks)
        tools.discover(__package__.rsplit(".", 1)[0] + ".tools", {
            "agents": Delegations(delegates), "skills": self.skills, "sources": self.sources, "settings": self.settings,
            "knowledge": self.knowledge, "hooks": self.hooks,
            "knowledge_minimum_threshold": lambda ctx: ctx.state.facts[0].get("knowledge_threshold", .4)})

        def messages(ctx, payload):
            role = self.npc.npc.get_npc_config(request["npc_id"]) if "npc_id" in request else {}
            ctx.state.facts = [{"knowledge_threshold": role.get("knowledge_threshold", .4)}]
            direct = ctx.policy.scopes & self.sources.scopes.keys()
            if not direct:
                ctx.state.tool_ceiling = ctx.policy.tools - SOURCE_TOOLS
            return [{"role": "system", "content": "按技能协调目标。只返回 JSON："
                     '{"status":"completed|needs_input|incomplete","kind":"conversation|rules",'
                     '"parts":[{"text":"玩家可读段落","evidence":["本次请求内的证据ID"]}],'
                     '"pending":["未完成事项"]}。段落按顺序换行拼接为正文；已核实规则附证据，'
                     '明确标注的推测与角色描写等另成段并省略 evidence。只写 parts，不另写 answer 或 claims。'
                     '直接交付原成果时提供 result_ref，parts 必须为 []，不要复制子任务调查记录；'
                     '自行综合时不填 result_ref，在 parts.evidence 中引用本次请求的成果或自己取得的证据。'
                     '本次请求内较早模型轮次取得的证据仍可复用，不必为换轮次重新读取。'
                     '子任务完成不等于整体目标完成。玩家正文不要输出内部标识。'},
                    {"role": "system", "content": "源码工具使用仓库相对路径，敏感资料不可读。"
                     "按需通过统一 skill 工具加载 source-investigation；自行源码调查的结果须增加该技能约定的 investigation 字段。"
                     if direct else "本轮源码工具不可用。"},
                    {"role": "user", "content": json_text(payload)}]

        def verify(result, ctx):
            value, gaps = result.value, []
            if result.status != value["status"]:
                gaps.append("invalid_status")
            if result.status == "completed" and value["pending"]:
                gaps.append("unresolved_questions")
            if result.status == "completed" and any(item["status"] != "ready" for item in ctx.state.receipts.values()):
                gaps.append("background_not_completed")
            if "result_ref" in value:
                try:
                    artifact = ctx.results.resolve(value["result_ref"], ctx)
                    if (value["result_ref"] not in ctx.state.result_refs or result.status != "completed"
                            or not isinstance(artifact["value"], dict) or not artifact["value"].get("answer")):
                        gaps.append("invalid_delivery")
                    if value["answer"] or value["claims"]:
                        gaps.append("delivery_requires_empty_parts")
                except RuntimeFault as error:
                    if error.status == "cancelled":
                        raise
                    gaps.append(error.code)
            else:
                if not value["answer"].strip():
                    gaps.append("missing_answer")
                if result.status == "completed" and value["kind"] == "rules" and not value["claims"]:
                    gaps.append("missing_rule_evidence")
                for claim in value["claims"]:
                    if not claim["evidence"]:
                        gaps.append("unknown_claim_evidence")
                    for key in claim["evidence"]:
                        if key in ctx.state.evidence:
                            record = ctx.state.evidence[key]
                            if record.get("truncated") and record.get("origin") != "source.read":
                                gaps.append("unknown_or_partial_evidence")
                            continue
                        try:
                            if key not in ctx.state.result_refs:
                                raise RuntimeFault("unknown_claim_evidence")
                            artifact = ctx.results.resolve(key, ctx)
                            if not isinstance(artifact["value"], dict) or not artifact["value"].get("claims"):
                                raise RuntimeFault("missing_rule_evidence")
                        except RuntimeFault as error:
                            if error.status == "cancelled":
                                raise
                            gaps.append(error.code)
                if gaps:
                    gaps.extend(evidence_reference_feedback(
                        (key for claim in value["claims"] for key in claim["evidence"]
                         if key not in ctx.state.result_refs), ctx.state.evidence))
                else:
                    # Professional claims have already passed their own evidence
                    # verification. A direct source investigation still verifies
                    # its own source references/coverage through the same Tool.
                    direct_claims = [{**claim, "evidence": [key for key in claim["evidence"]
                                                          if key in ctx.state.evidence]}
                                     for claim in value["claims"]]
                    direct = replace(result, value={**value, "claims": [claim for claim in direct_claims if claim["evidence"]]})
                    gaps.extend(verify_investigation(direct, ctx, tools))
            gaps.extend(player_text_gaps(value["answer"], ctx))
            if any(ref in value["answer"] for ref in ctx.state.result_refs):
                gaps.append("unsafe_player_text")
            return gaps

        agent = Agent("main_router", "围绕目标直接处理或按需协调专业任务", Contract({"type": "object"}), OUTPUT,
                      messages, context.policy, verify,
                      parse=parse_reply,
                      timeout=self.settings.chat_timeout, max_tokens=self.settings.max_tokens,
                      required_skills=("main-coordinator",), requires_commit=True, json_output=True)
        return Runner(self.model, [agent], tools, self.hooks, self.skills)

    def response(self, request, outcome):
        context, result = outcome.context, outcome.result
        context.check()
        value = result.value or {}
        answer = value.get("answer", "此事还须查证，少侠不妨稍后再问。")
        if "result_ref" in value:
            answer = context.results.resolve(value["result_ref"], context)["value"]["answer"]
        if player_text_gaps(answer, context) or any(ref in answer for ref in context.state.result_refs):
            raise RuntimeFault("unsafe_player_text")
        if len(answer) > self.settings.max_response_chars:
            raise RuntimeFault("size_limit", "incomplete")
        response = {"type": "agent_run", "request_id": request["request_id"], "status": result.status,
                    "answer": answer, "receipts": list(context.state.receipts.values())}
        json_text(response, MAX_DATAGRAM)
        return response

    def process_request(self, request, deadline, *, lifetime=None):
        context = None
        lock = None
        try:
            request = REQUEST.validate(request, MAX_DATAGRAM)
            if not request["goal"].strip() or len(request["goal"]) > self.settings.max_message_chars:
                raise RuntimeFault("contract_violation")
            with self.capacity.enter():
                context = self.context(request, deadline, lifetime)
                context.check()
                fingerprint = hashlib.sha256(json.dumps({"request": request,
                    "actor": context.actor, "audience": context.audience, "session": context.session,
                    "policy": context.policy.fingerprint(), "external_model": context.external_model},
                    ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()
                pending_lock = self._requests[hash(request["request_id"]) % len(self._requests)]
                while not pending_lock.acquire(timeout=.05):
                    context.check()
                lock = pending_lock
                cached = self.cache.get(request["request_id"], fingerprint, context.check)
                if cached is not None:
                    return cached
                runner = self.assemble(request, context)
                outcome = runner.run("main_router", {"goal": request["goal"],
                    "situation": request.get("context", {}).get("situation", "")}, context)
                if outcome.result.status == "completed":
                    return runner.commit(outcome, lambda value: self.cache.put(request["request_id"], fingerprint,
                        self.response(request, outcome), outcome.context.check))
                return self.response(request, outcome)
        except RuntimeFault as error:
            code = "busy" if error.code == "business_busy" else "invalid_request" if error.code == "contract_violation" else error.code
            return error_response(request, code, "此事眼下难以办妥，少侠不妨稍后再问。")
        finally:
            if lock is not None:
                lock.release()
            if context is not None:
                context.results.close()

    def close(self):
        self._stop.set()
        if self.client is not None:
            self.client.close()
        if self._owns_knowledge:
            self.knowledge.close()
