"""真实源码调查小样本：默认离线预览，仅合成资料，不以调用次数截断调查。"""
import argparse
import fnmatch
import json
import logging
import re
import sys
import tempfile
import threading
import time
from contextlib import ExitStack
from dataclasses import replace
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ai.src.npc.manager import NPCManager
from ai.src.llm import model_options_fingerprint
from ai.src.npc.service import NPCService
from ai.src.agents.router import RouterService
from ai.src.runtime.context import Budget, Limits, Policy, RunContext
from ai.src.runtime.cli import run_cli
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.settings import SERVICE_DIR, load_settings
from ai.src.usage_report import usage_report
from ai.src.tools.codegraph import command_prefix


FILES = {
    "teachers/elder.lpc": '''#include "../include/rules.h"
inherit "/common/learning";
// 青岚门授艺长老，传授回风剑诀；另一授艺入口见 teachers/hermit.lpc。
int teach_huifeng(object who) {
    if (!can_learn(who)) return 0;
    if (who->query("contribution") < HUIFENG_GATE) return 0;
    who->add("contribution", -HUIFENG_COST);
    who->set("learned/huifeng", 1);
    return 1;
}
''',
    "common/learning.lpc": '''// 青岚门的学习资格；剑法等级与特许称号是两条可选条件。
int can_learn(object who) {
    return who->query_skill("sword") >= 100 || who->query("title/qinglan_guest");
}
''',
    "include/rules.h": "#define HUIFENG_GATE 1200\n#define HUIFENG_COST 180\n",
    "skills/huifeng.lpc": '''// 青岚门回风剑诀的施展条件，不是传授条件。
int perform(object who) {
    if (!who->query("learned/huifeng")) return 0;
    if (who->query("neili") < 360) return 0;
    who->add("neili", -45);
    return 1;
}
''',
    "teachers/hermit.lpc": '''// 青岚门隐居旧师也传回风剑诀；独立授艺入口。
int teach_huifeng(object who) {
    if (!who->query("old_token")) return 0;
    who->delete("old_token");
    who->set("learned/huifeng", 1);
    return 1;
}
''',
}
CASES = (
    dict(name="multiple_files", expected="completed", files=FILES,
         question="青岚门回风剑诀如何学会、又怎样施展？请分清门槛和实际消耗，说明替代学习办法。",
         criteria=["长老授艺：剑法至少100级或有特许称号；贡献至少1200，实际扣180。源码未给出称号的正式名称。",
                   "另一独立入口：隐居旧师消耗所需信物，不要求上述剑法/称号/贡献。源码未给出信物的正式名称。",
                   "施展须已学会，内力至少360，实际扣45；不可把施展条件说成学习条件。"],
         required_files=sorted(FILES), exclude=[]),
    dict(name="ambiguous_name", expected="needs_input",
         files={"qinglan.lpc": '// 青岚门绝招惊鸿。\nint can_learn() { return 1; }\n',
                "chixia.lpc": '// 赤霞门绝招惊鸿。\nint can_learn() { return 0; }\n'},
         question="惊鸿怎么学？", criteria=["发现两个门派的同名绝招，请玩家说明门派，不武断选择。"],
         required_files=[], exclude=[]),
    dict(name="unavailable_dependency", expected="incomplete",
         files={"teachers/moon.lpc": '// 月影步的传授条件委托另一处资格判定。\n'
                'int teach_moon(object who) {\n    return "/restricted/admission"->can_learn(who);\n}\n',
                "restricted/admission.lpc": '// 不获准资料，仅用来测试实际读前拒绝。\n'
                'int can_learn(object who) { return who->query("contribution") >= 987654; }\n'},
         question="月影步要多少门派贡献才能学？", criteria=["关键资格判定不在授权范围，不能编造贡献数值。",
                                                              "玩家提示用游戏语言说明尚待查证，不泄露路径或工具错误。"],
         required_files=[], exclude=["restricted/*"]),
)


def plain(value):
    """Copy frozen Hook metadata; never serialize callbacks or SDK objects."""
    if hasattr(value, "items"):
        return {key: plain(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [plain(item) for item in value]
    return value


def tool_record(call_id, recorded):
    """Operational arguments and result metadata; no result bodies or authority."""
    fingerprint, reply = recorded
    name, arguments, _authority = json.loads(fingerprint)
    if isinstance(arguments, str):
        try:
            arguments = json.loads(arguments)
        except ValueError:
            arguments = {"invalid_json": True}
    value = reply.get("value", {})
    return dict(call_id=call_id, tool=name, arguments=arguments,
                ok=reply.get("ok"), error=reply.get("error", ""),
                evidence_count=len(value.get("evidence", [])) if isinstance(value, dict) else 0,
                truncated=value.get("truncated", False) if isinstance(value, dict) else False)


def tool_trace(state):
    return [tool_record(call_id, recorded) for call_id, recorded in state.calls.items()] if state else []


def selected_cases(only=None):
    cases = [dict(case) for case in CASES if only is None or case["name"] == only]
    if not cases:
        raise ValueError("unknown_case")
    return cases


def source_evidence(records):
    return [{key: item[key] for key in ("id", "scope", "path", "start", "end", "start_column", "end_column",
                                       "hash", "read_at", "revision")
             if key in item} for item in records.values() if item.get("origin") == "source.read"]


def delivery_projection(value, records, artifacts):
    """Report only final cited artifacts, never promote all child reads to evidence.

    Namespacing belongs to this offline report, not to the parent's model context.
    Human review still decides whether the cited artifact supports a conclusion.
    """
    evidence = source_evidence(records)
    used = {}

    def expand(key):
        artifact = artifacts.get(key)
        if artifact is None:
            return [key]
        if key not in used:
            used[key] = artifact
            evidence.extend({**item, "id": key + "/" + item["id"]}
                            for item in source_evidence(artifact["evidence"]))
        return [key + "/" + item for item in artifact["evidence"]]

    delivered = value
    ref = value.get("result_ref")
    if ref in artifacts:
        expand(ref)
        delivered = artifacts[ref]["value"]
        remap = lambda key: [ref + "/" + key]
    else:
        remap = expand
    claims = [{**claim, "evidence": [mapped for key in claim.get("evidence", []) for mapped in remap(key)]}
              for claim in delivered.get("claims", [])]
    investigation = delivered.get("investigation")
    if investigation:
        investigation = {**investigation,
            "entry": [mapped for key in investigation.get("entry", []) for mapped in remap(key)]}
    return dict(claims=claims, investigation=investigation, evidence=evidence,
                delivered_artifacts=[{"result_ref": key, "source": item["source"]} for key, item in used.items()])


def run_records(events, outcomes):
    """Per-run observations, not the inclusive parent budgets added a second time."""
    records = {}
    for event in events:
        run = records.setdefault(event["run_id"], {
            **{key: event[key] for key in ("run_id", "root_id", "parent_id", "agent")},
            "status": "unknown", "calls": [], "context_peak_tokens_estimated": None,
            "tool_trace": [], "completion_checks": []})
        if event["event"] == "run_end":
            run.update(status=event["status"], code=event.get("code", ""))
        if event["event"] == "tool_step":
            run["tool_trace"].append({key: event[key] for key in (
                "call_id", "tool", "arguments", "ok", "error", "evidence_count", "truncated")})
        if event["event"] == "completion_check":
            run["completion_checks"].append({"status": event["status"], "gaps": event["gaps"]})
        if event["event"] == "after_model":
            call = {key: event[key] for key in (
                "call_id", "operation", "model", "executed", "status", "code", "elapsed_ms",
                "context_tokens_estimated", "context_window_tokens", "reserved_output_tokens",
                "token_estimation", "usage", "usage_known") if key in event}
            run["calls"].append(call)
            tokens = call.get("context_tokens_estimated")
            if call.get("executed") and tokens is not None:
                run["context_peak_tokens_estimated"] = max(run["context_peak_tokens_estimated"] or 0, tokens)
    for outcome in outcomes:
        context, value = outcome.context, outcome.result.value or {}
        run = records.get(context.run_id)
        if run is not None:
            run.update(delegation_depth=context.delegation_depth, skills=sorted(context.state.skills),
                       tool_trace=tool_trace(context.state), evidence=source_evidence(context.state.evidence),
                       claims=value.get("claims", []) if isinstance(value, dict) else [],
                       compactions=plain(context.state.compactions))
    return list(records.values())


def run_cases(settings, *, on_case=None, on_progress=None, only=None, cases=None, synthetic_only=True,
              route="direct", cancel_requested=None):
    if route not in ("direct", "coordinated"):
        raise ValueError("unknown_route")
    cases = selected_cases(only) if cases is None else cases
    shared = Budget(Limits())
    reports = []
    interrupted = False
    with tempfile.TemporaryDirectory(prefix="ai-source-probe-") as temporary:
        root = Path(temporary)
        for case in cases:
            directory = root / case["name"]
            public = directory / "public"
            public.mkdir(parents=True)
            for path, content in case["files"].items():
                # Preserve the fixed accessible snapshot without deploying a
                # second, evaluation-only source permission matrix.
                if any(fnmatch.fnmatchcase(path, pattern) for pattern in case["exclude"]):
                    continue
                file = public / path
                file.parent.mkdir(parents=True, exist_ok=True)
                file.write_text(content, encoding="utf-8", newline="\n")
            (directory / "help").mkdir()
            (directory / "roles.json").write_text(json.dumps({"probe": {
                "name": "知事先生", "role": "替江湖客查证武学规矩的知事先生", "memory_capacity": 0}},
                ensure_ascii=False), encoding="utf-8")
            configured = replace(settings, data_dir=directory / "state", help_dir=directory / "help",
                                 roles_file=directory / "roles.json", source_enabled=True, source_root=public,
                                 dashscope_api_key="", rerank_enabled=False,
                                 world_enabled=False, knowledge_update_enabled=False, enabled_modules=("npc",))
            graph_setup = None
            if settings.codegraph_enabled:
                # Trusted test preparation only: index precisely the accessible
                # pinned copy, never the main checkout or excluded dependencies.
                prepared = time.monotonic()
                (public / "codegraph.json").write_text('{"extensions":{".lpc":"c"}}\n', encoding="utf-8")
                command = command_prefix(settings.codegraph_command)
                def cli(*arguments):
                    # Test preparation uses the same native/.cmd argv launcher
                    # as service queries; it grants no index operation to Agent.
                    probe = RunContext("prepare", "local", "admin", "probe", Policy(), None)
                    return run_cli(command, public, list(arguments), probe.bounded(60))
                version = cli("--version").strip()
                cli("init", str(public), "--yes")
                graph_setup = {"version": version, "extensions": {".lpc": "c"},
                               "setup_s": round(time.monotonic() - prepared, 3)}
            events, captured, artifacts = [], [], {}
            def observe(event):
                events.append(plain(event))
                if on_progress is not None and event["event"] in ("after_model", "completion_check", "tool_step"):
                    on_progress(dict(case=case["name"], progress={key: plain(event[key]) for key in (
                        "event", "run_id", "parent_id", "agent", "operation", "model", "executed", "status", "code", "gaps",
                        "call_id", "tool", "arguments", "ok", "error", "evidence_count", "truncated",
                        "elapsed_ms", "context_tokens_estimated", "usage", "usage_known") if key in event},
                        total=shared.snapshot()))
            callbacks = [Hook(name, observe) for name in ("run_start", "after_model", "after_tool", "run_end")]
            if cancel_requested is not None:
                def check_cancel(_event):
                    return Decision("cancel" if cancel_requested() else "allow")
                callbacks.extend(Hook(name, check_cancel, intervention=True) for name in
                                 ("before_model", "before_tool", "before_commit"))
            hooks = Hooks(callbacks)
            with ExitStack() as stack:
                manager = NPCManager(settings=configured, hooks=hooks)
                stack.callback(manager.close)
                if manager.client is None:
                    raise ValueError("model_unconfigured")
                def instrument(runner):
                    original_execute = runner.tools.execute
                    def execute(name, arguments, context, call_id):
                        try:
                            return original_execute(name, arguments, context, call_id)
                        finally:
                            # Observe after the tool has recorded its outcome.
                            # A forced stop must not erase all preceding steps.
                            recorded = context.state.calls.get(call_id)
                            if recorded is not None:
                                try:
                                    observe(dict(event="tool_step", run_id=context.run_id, root_id=context.root_id,
                                                 parent_id=context.parent_id, agent=context.agent_id,
                                                 **tool_record(call_id, recorded)))
                                except Exception:
                                    logging.warning("Probe tool observation failed")
                    runner.tools.execute = execute
                    for name, agent in runner.agents.items():
                        def verify(result, context, original=agent.verify):
                            gaps = tuple(original(result, context))
                            if gaps:
                                # Observe only safe codes, never rejected answer
                                # text or provider messages. Do not change checks.
                                try:
                                    observe(dict(event="completion_check", run_id=context.run_id, root_id=context.root_id,
                                                 parent_id=context.parent_id, agent=context.agent_id,
                                                 status="rejected", gaps=[code if isinstance(code, str)
                                                 and re.fullmatch(r"[a-z][a-z0-9_]{0,63}"
                                                                  r"(?::source:[a-f0-9]{32}(?:->source:[a-f0-9]{32})?)?", code)
                                                 else "completion_gap" for code in gaps]))
                                except Exception:
                                    logging.warning("Probe completion observation failed")
                            return gaps
                        runner.agents[name] = replace(agent, verify=verify)
                    original = runner.run
                    def capture(*args, **kwargs):
                        outcome = original(*args, **kwargs)
                        captured.append(outcome)
                        # Capture settled child provenance before the real router
                        # closes the request store. Do not alter execution/results.
                        if outcome.context.agent_id == "main_router":
                            for ref in outcome.context.state.result_refs:
                                try:
                                    artifacts[ref] = outcome.context.results.resolve(ref, outcome.context)
                                except RuntimeFault:
                                    pass  # Expired/denied refs cannot gain report evidence.
                        return outcome
                    runner.run = capture
                    return runner
                # Keep failure diagnostics even if the NPC adapter raises instead
                # of returning a Reply. This never runs the model a second time.
                instrument(manager.runner)
                service = NPCService(configured, npc_manager=manager)
                stack.callback(service.close)
                request = dict(type="chat", request_id=case["name"], npc_id="probe", player_id=case["name"],
                               player_name="旅人", message=case["question"], context="静室问学")
                context = manager.create_context(case["name"], "probe", case["name"])
                context = replace(context, budget=Budget(context.budget.limits, shared))
                if route == "coordinated":
                    router = RouterService(configured, npc=service, model=manager.runner.model,
                                           knowledge=manager.knowledge, hooks=hooks)
                    stack.callback(router.close)
                    request = dict(type="agent_run", request_id=case["name"], npc_id="probe",
                                   player_id=case["name"], goal=case["question"], context={"situation": "静室问学"})
                    context = router.context(request, None, None)
                    context = replace(context, budget=Budget(context.budget.limits, shared))
                    router.context = lambda *args: context
                    assemble = router.assemble
                    router.assemble = lambda *args: instrument(assemble(*args))
                stack.callback(context.results.close)
                started = time.monotonic()
                try:
                    response = (service.process_request(request, context.deadline, parent=context) if route == "direct"
                                else router.process_request(request, None))
                except KeyboardInterrupt:
                    # Keep the interrupted call's known/unknown receipt. Do not
                    # start the next case or replay the cancelled business call.
                    context.budget.cancelled.set()
                    interrupted = True
                    response = {"code": "cancelled"}
                interrupted = interrupted or shared.cancelled.is_set()
                elapsed = round(time.monotonic() - started, 3)
                primary = "npc_dialogue" if route == "direct" else "main_router"
                outcome = next((item for item in reversed(captured) if item.context.agent_id == primary), None)
                terminal = next((e for e in reversed(events) if e["event"] == "run_end" and e["agent"] == primary), {})
                if interrupted:
                    terminal = {"status": "cancelled", "code": "cancelled"}
                value = outcome.result.value if outcome is not None and isinstance(outcome.result.value, dict) else {}
                state = outcome.context.state if outcome is not None else None
                runs = run_records(events, captured)
                projection = delivery_projection(value, state.evidence if state else {}, artifacts)
                read_paths = {item["path"] for run in runs for item in run.get("evidence", [])}
                report = dict(case=case["name"], route=route, question=case["question"], expected_status=case["expected"],
                              expected_criteria=case["criteria"], status=terminal.get("status", "failed"),
                              code=terminal.get("code", response.get("code", "")), response=response,
                              elapsed_s=elapsed, budget=context.budget.snapshot(),
                              codegraph=graph_setup,
                              pending=value.get("pending", state.pending if state else []),
                              candidate_claims=value.get("claims", []), **projection,
                              skills=sorted(state.skills) if state else [],
                              tool_trace=tool_trace(state),
                              runs=runs, delegation_count=context.budget.counts["delegations"],
                              compactions=[dict(item, run_id=run["run_id"], agent=run["agent"])
                                           for run in runs for item in run.get("compactions", [])],
                              tool_events=[{key: e[key] for key in ("tool", "status", "code", "elapsed_ms")}
                                           for e in events if e["event"] == "after_tool"],
                              checks=dict(expected_status=terminal.get("status") == case["expected"],
                                          model_returned_result=bool(value),
                                          required_files_read=set(case["required_files"]) <= read_paths,
                                          denied_file_not_read=not any(
                                              fnmatch.fnmatchcase(path, pattern)
                                              for path in read_paths for pattern in case["exclude"])),
                              human_review_required=True)
                report["cost"] = usage_report(context.budget.snapshot(), settings.model_prices_per_million,
                                               settings.cost_currency)
                reports.append(report)
                if on_case is not None:
                    on_case(report, shared.snapshot())
                if interrupted:
                    break
    return dict(model=settings.chat_model, max_tokens=settings.max_tokens, route=route,
                model_options_fingerprint=model_options_fingerprint(settings),
                context_window_tokens=settings.context_window_tokens, synthetic_only=synthetic_only,
                execution="goal_driven", legacy_transport_deadline=False,
                source_access={"mode": "pinned_snapshot", "policy_version": "repository-source-v2"},
                retrieval="codegraph" if settings.codegraph_enabled else "literal",
                human_review_required=True, interrupted=interrupted, cases=reports, total=shared.snapshot(),
                cost=usage_report(shared.snapshot(), settings.model_prices_per_million, settings.cost_currency))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--execute", action="store_true", help="显式允许本批真实调用，不自动重跑")
    parser.add_argument("--report", type=Path, help="新建报告文件；已存在时拒绝，避免误重跑")
    parser.add_argument("--case", choices=tuple(c["name"] for c in CASES), help="只测试指定题目")
    parser.add_argument("--route", choices=("direct", "coordinated"), default="direct", help="直达 NPC 或主 Agent 协调")
    options = parser.parse_args(argv)
    try:
        cases = selected_cases(options.case)
    except ValueError as error:
        parser.error(str(error))
    if not options.execute:
        print(json.dumps(dict(mode="dry_run", route=options.route, execution="goal_driven", legacy_transport_deadline=False,
                              cases=[dict(name=c["name"]) for c in cases],
                              synthetic_only=True, human_review_required=True), ensure_ascii=False))
        return 0
    if options.report is None:
        parser.error("--execute 必须指定新的 --report 路径")
    logging.basicConfig(level=logging.WARNING)
    settings = load_settings()
    if not settings.chat_api_key or settings.chat_api_key.startswith("your-"):
        print(json.dumps(dict(error="model_unconfigured")))
        return 1
    options.report.parent.mkdir(parents=True, exist_ok=True)
    # Reserve the batch before any provider call. A stopped/failed batch remains
    # visible and cannot be silently resubmitted to the same report pathname.
    with (options.report.open("x", encoding="utf-8") as stream,
          Path(str(options.report) + ".events.jsonl").open("x", encoding="utf-8") as journal):
        report_lock = threading.Lock()
        partial = dict(state="started", model=settings.chat_model, route=options.route, synthetic_only=True, cases=[],
                       execution="goal_driven", selected_case=options.case,
                       source_access={"mode": "pinned_snapshot", "policy_version": "repository-source-v2"})
        def save(value):
            with report_lock:
                stream.seek(0)
                json.dump(value, stream, ensure_ascii=False, indent=2)
                stream.truncate()
                stream.flush()
        save(partial)
        def on_case(case, total):
            partial.pop("inflight", None)
            partial["cases"].append(case)
            partial["total"] = total
            save(partial)
            print(json.dumps({key: case[key] for key in ("case", "status", "elapsed_s", "budget", "checks")},
                             ensure_ascii=False), flush=True)
        def on_progress(value):
            journal.write(json.dumps(value, ensure_ascii=False) + "\n")
            journal.flush()
            partial["inflight"] = value
            save(partial)
            print(json.dumps(value, ensure_ascii=False), flush=True)
        try:
            report = run_cases(settings, on_case=on_case, only=options.case, route=options.route,
                               on_progress=on_progress,
                               cancel_requested=lambda: Path(str(options.report) + ".cancel").exists())
        except Exception as error:
            partial.update(state="interrupted", error=type(error).__name__)
            save(partial)
            print(json.dumps(dict(error=type(error).__name__, report=str(options.report))), flush=True)
            return 1
        report["state"] = "interrupted" if report["interrupted"] else "finished"
        save(report)
        print(json.dumps(dict(report=str(options.report), total=report["total"], human_review_required=True),
                         ensure_ascii=False), flush=True)
        return 1 if report["interrupted"] else 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
