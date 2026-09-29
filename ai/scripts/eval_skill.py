"""独立 Skill 效果测试：默认预览，--execute 才调用模型，不连接游戏。"""
import argparse
from contextlib import nullcontext
from dataclasses import replace
from datetime import datetime, timezone
import hashlib
import json
import logging
import os
from pathlib import Path
import sys
import time
import uuid

SERVICE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVICE_DIR))

from src.llm import ChatModel, create_chat_client, model_options_fingerprint
from src.runtime.context import Policy, RunContext
from src.runtime.contracts import Contract, RuntimeFault, parse_json
from src.runtime.hooks import Hook, Hooks
from src.runtime.lifecycle import error_code
from src.runtime.runner import Agent, Result, Runner
from src.runtime.skills import Skills
from src.runtime.tools import Tools
from src.settings import load_settings
from src.source_config import load_sources
from src.tools.skills import build_tools as skill_tools
from src.tools.source import build_tools as source_tools
from src.usage_report import usage_report


def run_evaluation(model, settings, prompt, *, skill=None, system="", mode="single",
                   json_output=False, repository=None, allow_source_egress=False):
    """Run one local case through the shared runtime, without business services.

    Completion means a final response was produced, not that its facts or style
    passed review. Format checks happen afterwards so a bad answer is preserved,
    not silently repaired by another model turn.
    """
    if repository is not None and (mode != "tool_loop" or not allow_source_egress):
        raise ValueError("Source evaluation requires tool_loop and explicit egress permission")
    events = []
    def observe(event):
        events.append({key: event[key] for key in (
            "event", "operation", "tool", "status", "code", "executed", "elapsed_ms",
            "context_tokens_estimated", "reserved_output_tokens") if key in event})
    hooks = Hooks([Hook(event, observe) for event in ("after_model", "after_tool", "run_end")])
    tools = Tools(hooks=hooks)
    skills = Skills(settings.skills_dir) if skill else None
    tool_names = set()
    if skills is not None:
        for tool in skill_tools({"skills": skills}):
            tools.register(tool)
        tool_names.add("skill")
    if repository is not None:
        sources = load_sources(replace(settings, source_enabled=True, source_root=Path(repository).absolute()))
        for tool in source_tools({"sources": sources}):
            tools.register(tool)
        tool_names.update(("source.search", "source.read"))
    scopes = {"repository"} if repository is not None else set()
    policy = Policy(tools=tool_names, skills={skill} if skill else set(), agents={"skill_eval"},
                    scopes=scopes, egress_scopes=scopes, version="local-skill-eval-v1")

    def messages(context, payload):
        return [{"role": "system", "content": system or "根据用户输入完成任务，使用已加载的专业指导（如有）。"},
                {"role": "user", "content": payload["goal"]}]

    agent = Agent("skill_eval", "独立 Skill 效果测试", Contract({"type": "object"}),
                  Contract({"type": "string"}), messages, policy, lambda result, context: (),
                  mode=mode, required_skills=(skill,) if skill else (),
                  timeout=settings.chat_timeout, max_tokens=settings.max_tokens,
                  operation="skill_eval", json_output=json_output)
    context = RunContext(uuid.uuid4().hex, "local-evaluator", "internal", "isolated", policy, None)
    runner = Runner(model, [agent], tools, hooks, skills)
    started = time.monotonic()
    outcome = None
    try:
        outcome = runner.run(agent.name, {"goal": prompt}, context)
        result = outcome.result
    except KeyboardInterrupt:
        context.budget.cancelled.set()
        result = Result("cancelled", code="cancelled")
    elapsed = time.monotonic() - started
    answer = result.value
    valid = isinstance(answer, str) and bool(answer.strip())
    parsed = None
    if json_output and valid:
        try:
            parsed = parse_json(answer)
            valid = isinstance(parsed, dict)
        except RuntimeFault:
            valid = False
    snapshot = context.budget.snapshot()
    loaded = outcome.context.state.skills if outcome else {}
    report = {
        "schema_version": 1, "time": datetime.now(timezone.utc).isoformat(),
        "status": result.status, "code": result.code, "answer": answer,
        "format_valid": valid, "human_review_required": True,
        "business_validation": "not_run", "mode": mode,
        "output_mode": "json_object" if json_output else "text",
        "input": prompt, "system": system, "requested_skill": skill,
        "skills": [{"name": name, "version": value["metadata"]["version"], "hash": value["hash"],
                    "resources": value["resources"],
                    "loaded_resources": sorted(value["loaded_resources"])} for name, value in loaded.items()],
        "model": settings.chat_model, "model_options_fingerprint": model_options_fingerprint(settings),
        "context_window_tokens": settings.context_window_tokens,
        "model_max_output_tokens": settings.model_max_output_tokens, "text_max_tokens": settings.max_tokens,
        "repository": str(Path(repository).absolute()) if repository is not None else None,
        "authorized_tools": sorted(tool_names) if mode == "tool_loop" else [],
        "elapsed_s": round(elapsed, 3), "usage": snapshot, "events": events,
        "cost": usage_report(snapshot, settings.model_prices_per_million, settings.cost_currency),
    }
    if json_output:
        report["parsed"] = parsed
    # Evidence is diagnostic data, never an assertion of semantic correctness.
    report["evidence"] = list(outcome.context.state.evidence.values()) if outcome else []
    return report


def parser():
    cli = argparse.ArgumentParser(description=__doc__)
    inputs = cli.add_mutually_exclusive_group(required=True)
    inputs.add_argument("--input", help="测试输入；省略 --skill 可直接测试模型")
    inputs.add_argument("--input-file", type=Path, help="UTF-8 输入文件，按原文发送，不要求特定 JSON 结构")
    cli.add_argument("--skill", help="业务 Skill 名称，如 world-narration")
    cli.add_argument("--skills-dir", type=Path, help="本次测试的 Skill 包根目录，默认采用服务配置")
    cli.add_argument("--system-file", type=Path, help="可选 UTF-8 系统指导，如角色资料和入口输出契约")
    cli.add_argument("--model", help="仅本次覆盖模型，不修改 .env")
    cli.add_argument("--env-file", type=Path, help="独立模型配置；进程环境变量仍优先")
    cli.add_argument("--mode", choices=("single", "tool_loop"), default="single",
                     help="默认单次生成；tool_loop 允许按需读取所选 Skill 的参考资料")
    cli.add_argument("--json", dest="json_output", action="store_true", help="明确要求 JSON Object 输出")
    cli.add_argument("--repository", type=Path, help="显式启用此仓库的 source.search/read；需 tool_loop")
    cli.add_argument("--allow-source-egress", action="store_true", help="允许必要源码片段发送给本次模型")
    cli.add_argument("--report", type=Path, help="可选新建 JSON 报告，不覆盖；父目录须已存在并受保护")
    cli.add_argument("--execute", action="store_true", help="允许发送输入、指导及所选资料并消费模型额度")
    return cli


def main(argv=None):
    cli = parser()
    options = cli.parse_args(argv)
    if options.repository is not None and options.mode != "tool_loop":
        cli.error("--repository 需要 --mode tool_loop")
    if options.repository is not None and options.execute and not options.allow_source_egress:
        cli.error("源码测试需要 --allow-source-egress 明确允许必要片段外发")
    if options.allow_source_egress and options.repository is None:
        cli.error("--allow-source-egress 需要 --repository")
    logging.basicConfig(level=logging.WARNING)
    try:
        prompt = options.input if options.input is not None else options.input_file.read_text(encoding="utf-8-sig")
        system = options.system_file.read_text(encoding="utf-8-sig") if options.system_file else ""
        if not prompt.strip():
            cli.error("测试输入不能为空")
        settings = load_settings(options.env_file)
        overrides = {}
        if options.model:
            overrides["chat_model"] = options.model
        if options.skills_dir is not None:
            overrides["skills_dir"] = options.skills_dir.absolute()
        settings = replace(settings, **overrides)
        if not options.execute:
            print(json.dumps({"mode": "preview", "execution_mode": options.mode, "model": settings.chat_model,
                              "skill": options.skill, "skills_dir": str(settings.skills_dir),
                              "input_chars": len(prompt), "input_hash": hashlib.sha256(prompt.encode()).hexdigest(),
                              "system_chars": len(system), "json_output": options.json_output,
                              "source_read": False, "repository": str(options.repository) if options.repository else None,
                              "model_calls": 0, "report_written": False,
                              "notice": "执行会发送本次输入、系统指导及所选 Skill；请确认没有私密资料。"},
                             ensure_ascii=False, indent=2))
            return 0
        # Reserve the output before any paid call; never overwrite an old run.
        destination = nullcontext(None)
        if options.report is not None:
            descriptor = os.open(options.report, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            destination = os.fdopen(descriptor, "w", encoding="utf-8", newline="\n")
        with destination as stream:
            if stream is not None:
                json.dump({"state": "started"}, stream)
                stream.flush()
            client = None
            try:
                client = create_chat_client(settings)
                if client is None:
                    raise RuntimeFault("model_unconfigured")
                report = run_evaluation(ChatModel(settings, client), settings, prompt,
                                        skill=options.skill, system=system, mode=options.mode,
                                        json_output=options.json_output, repository=options.repository,
                                        allow_source_egress=options.allow_source_egress)
            except KeyboardInterrupt:
                report = {"status": "cancelled", "code": "cancelled", "human_review_required": True}
            except Exception as error:
                report = {"status": "failed", "code": error_code(error, "evaluation_failed"),
                          "human_review_required": True}
            finally:
                if client is not None:
                    try:
                        client.close()
                    except Exception:
                        logging.warning("Model client cleanup failed; evaluation will not be repeated")
            if stream is not None:
                stream.seek(0)
                json.dump(report, stream, ensure_ascii=False, indent=2)
                stream.truncate()
            print(json.dumps(report, ensure_ascii=False, indent=2))
            if report["status"] == "cancelled":
                return 130
            return 0 if report["status"] == "completed" and report.get("format_valid") else 1
    except Exception as error:
        # Provider/config exceptions may contain credentials or private input.
        print(json.dumps({"status": "failed", "code": error_code(error, "evaluation_setup_failed"),
                          "hint": "检查配置、输入文件和报告路径；报告不得覆盖，父目录须已存在。"}, ensure_ascii=False),
              file=sys.stderr)
        return 1


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
