"""Trusted NPC assembly, runtime adapters and deterministic relationships."""
import json
import logging
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit

from ..knowledge_qwen import QwenKnowledgeSystem
from ..llm import ChatModel, create_chat_client
from ..runtime.context import Budget, RunContext
from ..runtime.hooks import Hooks
from ..runtime.runner import Runner
from ..runtime.skills import Skills
from ..runtime.tools import Tools
from ..settings import load_settings
from .agents import LIMITS, POLICY, build_agents

logger = logging.getLogger(__name__)


class ChatUnavailable(Exception):
    pass


@dataclass(frozen=True)
class Reply:
    text: str
    simulated: bool = False
    status: str = "completed"
    outcome: object = None


class NPCManager:
    def __init__(self, config_file=None, settings=None, knowledge=None, client=None, *, hooks=None):
        self.settings = settings or load_settings()
        self.config_file = Path(config_file) if config_file else self.settings.roles_file
        self._owns_knowledge = knowledge is None
        self._owns_client = client is None
        self.npc_configs = {}
        self.load_npc_configs()
        self.hooks = hooks or Hooks()
        skills = Skills(self.settings.skills_dir)
        self.knowledge = knowledge if knowledge is not None else QwenKnowledgeSystem(settings=self.settings)
        try:
            self.client = client if client is not None else create_chat_client(self.settings)
            tools = Tools(hooks=self.hooks)
            tools.discover(__package__.rsplit(".", 1)[0] + ".tools",
                           {"skills": skills, "knowledge": self.knowledge, "hooks": self.hooks,
                            "knowledge_minimum_threshold": lambda context: context.state.facts[0].get(
                                "knowledge_threshold", .4)})
            self.runner = Runner(ChatModel(self.settings, self.client), build_agents(self.settings),
                                 tools=tools, hooks=self.hooks, skills=skills)
        except Exception:
            if self._owns_knowledge:
                self.knowledge.close()
            if self._owns_client and getattr(self, "client", None) is not None:
                self.client.close()
            raise
        logger.info(
            "Chat configuration: model=%s host=%s enabled=%s chat_timeout_s=%.2f "
            "summary_timeout_s=%.2f retrieval_timeout_s=%.2f request_timeout_s=%.2f",
            self.settings.chat_model, urlsplit(self.settings.chat_base_url).hostname,
            self.client is not None, self.settings.chat_timeout, self.settings.summary_timeout,
            self.settings.api_timeout, self.settings.request_timeout,
        )

    def load_npc_configs(self):
        if not self.config_file.exists():
            logger.warning("NPC roles file is missing: %s", self.config_file)
            return
        data = json.loads(self.config_file.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise ValueError("NPC roles must be a JSON object")
        configs = {}
        for npc_id, role in data.items():
            if not isinstance(role, dict):
                raise ValueError(f"Invalid NPC configuration: {npc_id}")
            role = dict(role)
            capacity = role.get("memory_capacity", 100)
            threshold = role.get("knowledge_threshold", 0.4)
            if type(capacity) is not int or capacity < 0:
                raise ValueError(f"Invalid memory_capacity: {npc_id}")
            if not isinstance(threshold, (int, float)) or not 0 <= threshold <= 1:
                raise ValueError(f"Invalid knowledge_threshold: {npc_id}")
            role["memory_capacity"] = max(10, capacity) if capacity else 0
            for key, default in {"name": npc_id, "title": "江湖人士", "role": "侠客",
                                 "personality": "友善", "background": "行走江湖",
                                 "speech_style": "古雅自然", "greeting": "少侠有礼了。"}.items():
                role.setdefault(key, default)
                if not isinstance(role[key], str):
                    raise ValueError(f"Invalid {key}: {npc_id}")
            for key in ("topics", "knowledge_base"):
                role.setdefault(key, [])
                if not isinstance(role[key], list) or not all(isinstance(v, str) for v in role[key]):
                    raise ValueError(f"Invalid {key}: {npc_id}")
            tips = role.setdefault("relationship_tips", {})
            if not isinstance(tips, dict) or any(
                not isinstance(values, list) or not all(isinstance(v, str) for v in values)
                for values in tips.values()
            ):
                raise ValueError(f"Invalid relationship_tips: {npc_id}")
            configs[npc_id] = role
        self.npc_configs = configs

    def get_npc_config(self, npc_id):
        return self.npc_configs.get(npc_id, {})

    def create_context(self, request_id, npc_id, player_id, deadline=None):
        limit = time.monotonic() + min(80, self.settings.request_timeout)
        return RunContext(request_id, player_id, "player", json.dumps([npc_id, player_id]), POLICY,
                          min(limit, deadline) if deadline is not None else limit, budget=Budget(LIMITS))

    def generate_response(self, npc_id, player_name, message, player_memory, history, context,
                          deadline=None, *, run_context=None, defer_commit=False):
        role = self.get_npc_config(npc_id)
        if not role:
            raise ValueError("此人眼下无心交谈。")
        if self.client is None:
            return Reply(f"{role['name']}说：{role['greeting']}", simulated=True)
        run_context = run_context or self.create_context(uuid.uuid4().hex, npc_id, player_name, deadline)
        outcome = self.runner.run("npc_dialogue", {
            "role": role, "player_name": player_name, "message": message, "memory": player_memory,
            "history": history, "situation": context}, run_context)
        if outcome.result.status in ("failed", "cancelled"):
            raise ChatUnavailable("此人此刻心绪不宁，少侠不妨稍后再问。")
        value = outcome.result.value
        text = value["answer"] if isinstance(value, dict) else f"{role['name']}说：此事我还须查证，暂不敢贸然指点。"
        if outcome.result.status == "completed" and not defer_commit:
            self.runner.commit(outcome, lambda value: value)
        return Reply(text, status=outcome.result.status, outcome=outcome)

    def prepare_summary(self, previous, history, run_context):
        if self.client is None:
            return None
        outcome = self.runner.run("conversation_summary", {
            "previous_summary": previous, "conversation": history}, run_context)
        if outcome.result.status != "completed":
            raise ChatUnavailable("摘要未完成，本轮保留原历史")
        return outcome

    def summarize(self, previous, history, deadline=None):
        context = self.create_context(uuid.uuid4().hex, "summary", "diagnostic", deadline)
        outcome = self.prepare_summary(previous, history, context)
        return self.runner.commit(outcome, lambda text: text) if outcome is not None else None

    def update_player_memory(self, npc_id, player_id, player_name, message, response, player_memory=None):
        current = dict(player_memory or {})
        familiarity = min(100, round(current.get("familiarity", 0) + 0.1, 1))
        relationship = "陌生人"
        for threshold, name in ((5, "相识"), (15, "朋友"), (30, "好友"),
                                (50, "知己"), (75, "挚友"), (100, "至交")):
            if familiarity >= threshold:
                relationship = name
        current.update(
            name=player_name, familiarity=familiarity, relationship=relationship,
            trust=min(100, int(familiarity * 0.9 + 5)),
            favor=min(100, int(familiarity * 0.85 + 10)),
            total_interactions=current.get("total_interactions", 0) + 1,
            last_chat=time.strftime("%Y-%m-%d %H:%M:%S"),
        )
        current.setdefault("first_met", time.strftime("%Y-%m-%d"))
        return current

    def close(self):
        try:
            if self._owns_client and self.client is not None:
                client, self.client = self.client, None
                client.close()
        finally:
            if self._owns_knowledge and self.knowledge is not None:
                knowledge, self.knowledge = self.knowledge, None
                knowledge.close()
