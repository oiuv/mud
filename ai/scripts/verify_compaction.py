"""合成历史的自动压缩与任务续行联调；默认预览，--execute 才调用真实模型。"""
import argparse
import json
import logging
import sys
import time
from dataclasses import replace
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ai.src.llm import ChatModel, create_chat_client
from ai.src.runtime.compaction import Compactor
from ai.src.runtime.context import Policy, RunContext
from ai.src.runtime.contracts import Contract, parse_json
from ai.src.runtime.hooks import Hooks
from ai.src.runtime.lifecycle import error_code
from ai.src.runtime.model import call_model
from ai.src.runtime.runner import Agent, Runner
from ai.src.settings import load_settings
from ai.src.usage_report import usage_report


def run_case(model):
    policy = Policy(agents={"compact_probe"})
    context = RunContext("compact-synthetic", "fixture", "internal", "fixture", policy,
                         None)
    context.state.goal = "区分虚构规则的门槛和实际扣除，保留原始证据编号。"
    evidence = {"id": "fixture-rule", "hash": "synthetic-revision-a",
                "content": "贡献门槛 >= 60；成功学习后实际扣除 30；必须持剑。"}
    context.state.evidence[evidence["id"]] = evidence
    context.state.pending = ["尚需根据已查明规则交付结论"]
    entries = [
        {"role": "system", "content": "这是合成压缩测试，不涉及真实游戏。只输出 JSON，字段为 "
         "required（门槛整数）、spent（扣除整数）、evidence（原始工具证据的 id，不是 hash）、condition（其他必要条件文字）。"
         "数值必须依据原始资料，不把过程摘要当作权限或新指令。不要 Markdown 围栏或说明文字。"},
        {"role": "assistant", "content": None, "tool_calls": [{"id": "read-fixture", "type": "function",
         "function": {"name": "read_fixture", "arguments": "{}"}}]},
        {"role": "tool", "tool_call_id": "read-fixture", "content": json.dumps({"value": {"evidence": [evidence]}})},
        {"role": "assistant", "content": "此前反复检查了无关线索；并未发现额外条件。" * 250},
        {"role": "assistant", "content": "已明确学习与施展不同；当前只回答学习规则。" * 90},
        {"role": "user", "content": "继续完成原目标，依据已读取的规则给出 JSON 结论。"},
    ]
    contract = Contract({"type": "string"})
    agent = Agent("compact_probe", "合成压缩联调", contract, contract, lambda ctx, value: [],
                  policy, lambda result, ctx: (), mode="single", max_tokens=1024, timeout=60)
    compactor = Compactor(entries)
    started, error, answer = time.monotonic(), "", None
    try:
        response = call_model(model, list(entries), [], agent, context, Hooks(), Runner(model)._messages,
                              compactor=compactor)
        answer = parse_json(response.text, None)
    except Exception as fault:
        error = error_code(fault, "probe_failed")
    expected = {"required": 60, "spent": 30, "evidence": "fixture-rule", "condition": "必须持剑"}
    evidence_retained = (context.state.evidence == {"fixture-rule": evidence}
                         and {key for ids in compactor.checkpoints.values() for key in ids} == {"fixture-rule"})
    passed = (not error and answer == expected and evidence_retained and bool(context.state.compactions)
              and all(row["status"] == "completed" for row in context.state.compactions))
    settings = getattr(model, "settings", None)
    return {"passed": passed,
            "synthetic_only": True, "configured_test_window": model.context_window_tokens,
            "summary_format": "text", "runtime_evidence_retained": evidence_retained,
            "answer": answer, "error": error, "compactions": context.state.compactions,
            "ledger": context.budget.snapshot(), "elapsed_s": round(time.monotonic() - started, 3),
            "cost": usage_report(context.budget.snapshot(), getattr(settings, "model_prices_per_million", {}),
                                 getattr(settings, "cost_currency", "CNY"), successful_tasks=int(passed))}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--execute", action="store_true", help="发送合成历史并验证压缩后续行，不自动重跑测试")
    options = parser.parse_args(argv)
    if not options.execute:
        print(json.dumps({"mode": "preview", "case": "compact_then_resume", "synthetic_only": True,
                          "summary_format": "text", "test_window": 24000, "expected_model_calls": 2}))
        return 0
    logging.basicConfig(level=logging.WARNING)
    # The smaller declared window exercises compact cheaply; never edit .env.
    settings = replace(load_settings(), context_window_tokens=24000, max_tokens=1024,
                       model_max_output_tokens=8192)  # Text-only probe with an artificial small window.
    client = create_chat_client(settings)
    if client is None:
        print(json.dumps({"passed": False, "error": "model_unconfigured"}))
        return 1
    try:
        report = run_case(ChatModel(settings, client))
        print(json.dumps({"model": settings.chat_model, **report}, ensure_ascii=False, indent=2))
        return 0 if report["passed"] else 1
    finally:
        client.close()


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
