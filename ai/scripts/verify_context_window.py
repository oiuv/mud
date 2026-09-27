"""以三份合成输入对照保守估算与服务商 token 计量；--execute 才发出请求。"""
import argparse
import json
import logging
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ai.src.llm import ChatModel, create_chat_client
from ai.src.runtime.context import Policy, RunContext
from ai.src.runtime.contracts import Contract, json_text
from ai.src.runtime.hooks import Hook, Hooks
from ai.src.runtime.lifecycle import error_code
from ai.src.runtime.model import call_model
from ai.src.runtime.runner import Agent
from ai.src.settings import load_settings
from ai.src.usage_report import usage_report


def fixtures():
    instruction = {"role": "system", "content": "这是合成资料计量测试。不要调用工具，只回复 OK。"}
    definition = {"type": "function", "function": {
        "name": "read_fixture", "description": "读取虚构规则，不是真实游戏资料。",
        "parameters": {"type": "object", "properties": {"name": {"type": "string"}},
                       "required": ["name"], "additionalProperties": False}}}
    return [
        ("chinese", [instruction, {"role": "user", "content": "虚构门派需要贡献200，扣除50。" * 40}], []),
        ("english", [instruction, {"role": "user", "content": "Synthetic rule: require 200, spend 50. " * 40}], []),
        ("tool_history", [instruction, {"role": "user", "content": "查看虚构规则。"},
            {"role": "assistant", "content": None, "tool_calls": [{"id": "fixture-1", "type": "function",
             "function": {"name": "read_fixture", "arguments": '{"name":"虚构规则"}'}}]},
            {"role": "tool", "tool_call_id": "fixture-1", "content": "虚构门派：贡献门槛200，成功扣除50。"},
            {"role": "user", "content": "资料齐全，只回复 OK，不再调用工具。"}], [definition]),
    ]


def run_cases(model, only=None):
    if only is not None and only not in {row[0] for row in fixtures()}:
        raise ValueError("unknown_case")
    policy = Policy(agents={"context_probe"})
    contract = Contract({"type": "string"})
    agent = Agent("context_probe", "合成输入计量", contract, contract, lambda ctx, value: [],
                  policy, lambda result, ctx: (), mode="single", max_tokens=256, timeout=30)
    rows = []
    for name, messages, definitions in fixtures():
        if only is not None and name != only:
            continue
        context = RunContext(name, "synthetic", "internal", "context-probe", policy,
                             None)
        events = []
        hooks = Hooks([Hook("after_model", lambda event: events.append(dict(event)))])
        started = time.monotonic()
        error = ""
        try:
            call_model(model, messages, definitions, agent, context, hooks,
                       lambda value, ctx: len(json_text(value, None).encode("utf-8")))
        except Exception as fault:
            # Never print SDK bodies, configuration or arbitrary exception text.
            error = error_code(fault, "probe_failed")
        usage = context.budget.snapshot()["usage"]
        estimate = events[-1].get("context_tokens_estimated", 0) if events else 0
        observed = usage.get("prompt_tokens", 0)
        rows.append({"case": name, "passed": not error and 0 < observed <= estimate,
                     "input_estimated": estimate, "input_reported": observed,
                     "method": "utf8_conservative_v1", "usage": usage, "error": error,
                     "elapsed_s": round(time.monotonic() - started, 3),
                     "model_calls": context.budget.counts["model_calls"], "ledger": context.budget.snapshot()})
    settings = getattr(model, "settings", None)
    return {"passed": all(row["passed"] for row in rows), "synthetic_only": True, "cases": rows,
            "cost": usage_report([row["ledger"] for row in rows],
                                 getattr(settings, "model_prices_per_million", {}),
                                 getattr(settings, "cost_currency", "CNY"),
                                 successful_tasks=sum(row["passed"] for row in rows))}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--execute", action="store_true", help="执行选定的固定样本，各一次请求，无自动重试")
    parser.add_argument("--case", choices=[row[0] for row in fixtures()], help="只验证指定样本")
    options = parser.parse_args(argv)
    if not options.execute:
        print(json.dumps({"mode": "preview", "cases": [row[0] for row in fixtures()
                                                        if options.case is None or row[0] == options.case],
                          "synthetic_only": True}, ensure_ascii=False))
        return 0
    logging.basicConfig(level=logging.WARNING)
    settings = load_settings()
    client = create_chat_client(settings)
    if client is None:
        print(json.dumps({"passed": False, "error": "model_unconfigured"}))
        return 1
    try:
        report = run_cases(ChatModel(settings, client), options.case)
        print(json.dumps({"model": settings.chat_model, **report}, ensure_ascii=False, indent=2))
        return 0 if report["passed"] else 1
    finally:
        client.close()


if __name__ == "__main__":
    raise SystemExit(main())
