"""显式选择 --execute 才调用真实模型；只发送临时合成资料，不连接游戏或业务库。"""
import argparse
import json
import logging
import sys
import tempfile
import time
from dataclasses import replace
from pathlib import Path

SERVICE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_DIR))

from src.llm import ChatModel, create_chat_client
from src.runtime.context import Budget, Limits, Policy, RunContext
from src.runtime.contracts import Contract, parse_json
from src.runtime.hooks import Hook, Hooks
from src.runtime.runner import Agent, Result, Runner
from src.runtime.skills import Skills
from src.runtime.tools import Tools
from src.settings import load_settings


def run_cases(model, model_name):
    """Two bounded cases; the caller owns the client and all provider authority."""
    limits = Limits(model_calls=6, external_calls=6, tool_calls=8, total_bytes=262144)
    shared = Budget(limits)
    results = []
    policy = Policy(tools={"skill"}, skills={"test-ritual", "test-summary"}, agents={"probe"})
    inputs = Contract({"type": "object", "required": ["goal"], "properties": {
        "goal": {"type": "string"}}, "additionalProperties": False})
    outputs = Contract({"type": "object", "required": ["required", "spent"], "properties": {
        "required": {"type": "integer"}, "spent": {"type": "integer"}}, "additionalProperties": False})
    with tempfile.TemporaryDirectory(prefix="ai-runtime-probe-") as temporary:
        root = Path(temporary)
        packages = (
            ("test-ritual", "霞门入门规则调查：区分入门贡献门槛和实际扣除。",
             "回答前通过 skill 的 path 参数读取 references/rules.md；根据资料区分门槛与扣除，不能猜测。",
             {"references/rules.md": "【合成测试规则，并非真实游戏】霞门入门需已有贡献至少 200；入门成功扣除贡献 50。"}),
            ("test-summary", "测试摘要：只提取明确的两个数值。",
             "从输入提取贡献门槛 required 与实际扣除 spent 两个整数。不得将门槛误作扣除；只输出 JSON。", {}),
        )
        for name, description, body, resources in packages:
            directory = root / name
            directory.mkdir()
            metadata = {"name": name, "description": description, "version": "1", "resources": list(resources)}
            (directory / "SKILL.md").write_text("---\n" + json.dumps(metadata, ensure_ascii=False)
                                               + "\n---\n" + body, encoding="utf-8")
            for path, content in resources.items():
                resource = directory / path
                resource.parent.mkdir(parents=True, exist_ok=True)
                resource.write_text(content, encoding="utf-8")
        skills = Skills(root)
        for name, mode, required, question in (
            ("discover_and_read", "tool_loop", (), "依照霞门入门指引，查明需要多少贡献、成功后扣除多少？"),
            ("direct_preload", "single", ("test-summary",), "合成资料：入门贡献门槛为 200，实际扣除为 50。"),
        ):
            events = []
            hooks = Hooks([Hook(event, lambda e: events.append(dict(e)))
                           for event in ("after_model", "after_tool", "run_end")])
            tools = Tools(hooks=hooks)
            tools.discover("src.tools", {"skills": skills})
            def messages(context, payload):
                return [{"role": "system", "content": "完成给定任务。需要专业资料时使用获准的技能工具。"
                         "最后只输出 JSON 对象，required 表示贡献门槛，spent 表示实际扣除；不用 Markdown。"},
                        {"role": "user", "content": payload["goal"]}]
            agent = Agent("probe", "合成资料运行时验证", inputs, outputs, messages, policy,
                          lambda result, state: (), parse=lambda text: Result("completed", parse_json(text)),
                          mode=mode, required_skills=required, max_tokens=512, timeout=25,
                          limits=replace(limits, model_calls=5 if mode == "tool_loop" else 1))
            context = RunContext("synthetic-" + name, "synthetic-actor", "internal", "synthetic-session",
                                 policy, time.monotonic() + 90, budget=Budget(limits, shared))
            started = time.monotonic()
            outcome = Runner(model, [agent], tools, hooks, skills).run("probe", {"goal": question}, context)
            success = (outcome.result.status == "completed" and outcome.result.value == {"required": 200, "spent": 50}
                       and set(outcome.context.state.skills) >= ({"test-ritual"} if mode == "tool_loop" else {"test-summary"})
                       and sum(event["event"] == "run_end" for event in events) == 1)
            if mode == "tool_loop":
                success &= "references/rules.md" in outcome.context.state.skills.get("test-ritual", {}).get("loaded_resources", {})
            else:
                success &= context.budget.counts["model_calls"] == 1
            results.append({"case": name, "passed": bool(success), "status": outcome.result.status,
                            "code": outcome.result.code, "answer": outcome.result.value,
                            "elapsed_s": round(time.monotonic() - started, 3),
                            "budget": context.budget.snapshot(),
                            "events": [{key: event[key] for key in ("event", "status", "executed") if key in event}
                                       for event in events]})
    return {"model": model_name, "synthetic_only": True, "passed": all(item["passed"] for item in results),
            "cases": results, "total": shared.snapshot()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--execute", action="store_true", help="允许本次调用真实模型（总计最多 6 次，无自动重试）")
    parser.add_argument("--env-file", type=Path, help="本地服务配置；不打印内容")
    parser.add_argument("--model", help="只为本次验证指定模型，不修改部署配置")
    options = parser.parse_args()
    if not options.execute:
        print(json.dumps({"mode": "dry_run", "cases": ["discover_and_read", "direct_preload"],
                          "max_model_calls": 6, "data": "synthetic fixtures only"}, ensure_ascii=False))
        return 0
    logging.basicConfig(level=logging.WARNING)
    settings = load_settings(options.env_file)
    if options.model:
        settings = replace(settings, chat_model=options.model)
    client = create_chat_client(settings)
    if client is None:
        print(json.dumps({"passed": False, "error": "model_unconfigured"}))
        return 1
    try:
        report = run_cases(ChatModel(settings, client), settings.chat_model)
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0 if report["passed"] else 1
    finally:
        client.close()


if __name__ == "__main__":
    raise SystemExit(main())
