"""验证本机 CodeGraph 的 LPC 覆盖；只在临时目录建库，不调用模型。"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import threading
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ai.src.runtime.context import Policy, RunContext
from ai.src.runtime.cli import run_cli
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.tools import Tools
from ai.src.settings import Settings
from ai.src.tools.codegraph import command_prefix, query_cli
from ai.src.tools.exec import build_tools
from ai.src.tools.source import Scope, Sources


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--execute", action="store_true", help="仅在临时目录建立/重建测试索引")
    parser.add_argument("--command", default="codegraph", help="程序名、路径或 JSON argv；支持正常 Windows .cmd 入口")
    parser.add_argument("--report", type=Path, help="新报告路径；不覆盖已有结果")
    args = parser.parse_args(argv)
    if not args.execute:
        print(json.dumps({"mode": "preview", "temporary_index_only": True, "model_calls": 0}))
        return 0
    if args.report is None:
        parser.error("执行时必须指定新 --report 路径")
    command = command_prefix(args.command)
    args.report.parent.mkdir(parents=True, exist_ok=True)
    # Reserve before execution; failed runs never silently repeat to the same report.
    with args.report.open("x", encoding="utf-8") as report:
        result = {"state": "started", "model_calls": 0, "temporary_index_only": True,
                  "query_operations": ["explore", "query", "callers", "callees", "impact", "node", "files"],
                  "coverage_probe_operation": "context"}
        def save():
            report.seek(0)
            json.dump(result, report, ensure_ascii=False, indent=2)
            report.truncate()
            report.flush()
        save()
        try:
            with tempfile.TemporaryDirectory(prefix="ai-codegraph-lpc-") as temp:
                root = Path(temp)
                fixtures = {
                    "elder.c": 'inherit "/base";\n// 青岚门授艺。\nint teach(object who) {\n'
                               '    return can_learn(who);\n}\n',
                    "base.c": 'int can_learn(object who) {\n    return who->query_skill("sword") >= 100;\n}\n',
                    "other.c": 'int teach(object who) {\n    return who->query("token");\n}\n',
                    "action.lpc": 'int perform(object who) {\n    return "/base"->can_learn(who);\n}\n',
                }
                for path, text in fixtures.items():
                    (root / path).write_text(text, encoding="utf-8", newline="\n")
                def cli(*arguments):
                    probe = RunContext("prepare", "local", "admin", "probe", Policy(), None)
                    return run_cli(command, root, list(arguments), probe.bounded(60))
                result["version"] = cli("--version").strip()
                cli("init", str(root), "--yes")
                context = RunContext("probe", "local", "admin", "probe", Policy(
                    tools={"exec"}, scopes={"repository"}, egress_scopes={"repository"}), None)
                def raw(query):
                    return query_cli(command, root, query, context.bounded(15))
                result["before_mapping_lpc"] = [n["filePath"] for n in raw("perform")["nodes"]]
                (root / "codegraph.json").write_text('{"extensions":{".lpc":"c"}}\n', encoding="utf-8")
                cli("index", str(root), "--quiet")
                result["after_mapping_lpc"] = [n["filePath"] for n in raw("perform")["nodes"]]
                sources = Sources((Scope("repository", root),))
                settings = Settings(source_root=root, codegraph_enabled=True, codegraph_command=args.command,
                                    codegraph_operations=("explore", "query", "callers", "callees", "impact", "node", "files"))
                tools = Tools(build_tools({"sources": sources, "settings": settings}))
                def query(arguments, run_context=None):
                    reply = tools.execute("exec", {"program": "codegraph", "args": arguments},
                                          run_context or context, "probe-" + str(len(context.state.calls)))
                    if not reply["ok"]:
                        result["failed_query"] = arguments
                        raise RuntimeFault(reply["error"])
                    return reply["value"]
                result["queries"] = {name: query(["query", name])
                                     for name in ("teach", "perform can_learn", "青岚门")}
                result["operations"] = {operation: query(arguments)
                    for operation, arguments in {
                        "explore": ["explore", "teach"],
                        "query": ["query", "teach"],
                        "callers": ["callers", "can_learn"],
                        "callees": ["callees", "teach"],
                        "impact": ["impact", "can_learn"],
                        "node": ["node", "teach", "--file", "elder.c"],
                        "files": ["files"],
                    }.items()}
                result["node_file"] = query(["node", "elder.c"])
                result["empty_queries"] = {
                    op: query([op, "--filter", "absent_directory"] if op == "files"
                              else [op, "absent_symbol"])
                    for op in ("files", "query", "callers", "callees", "impact")}
                for path in ("elder.c", "other.c"):
                    (root / path).write_text("// shifted\n" * 10 + fixtures[path], encoding="utf-8")
                result["stale"] = query(["query", "teach"])
                result["checks"] = {
                    **{f"actual_{op}": value["status"] == "matched"
                       for op, value in result["operations"].items()},
                    "node_file": result["node_file"]["status"] == "matched",
                    "empty_queries_are_no_match": all(
                        value["status"] == "no_match" and not value["evidence"]
                        for value in result["empty_queries"].values()),
                    "evidence_registered": all(e == context.state.evidence.get(e["id"])
                        for value in result["operations"].values() for e in value["evidence"]),
                    "lpc_missing_without_mapping": "action.lpc" not in result["before_mapping_lpc"],
                    "lpc_found_with_mapping": "action.lpc" in result["after_mapping_lpc"],
                    "same_named_candidates": {"elder.c", "other.c"} <= {
                        n["path"] for n in result["queries"]["teach"]["symbols"]},
                    "stale_not_mislabelled": result["stale"]["status"] == "index_outdated"
                        and not any(n["path"] in ("elder.c", "other.c") for n in result["stale"]["symbols"]),
                }
                if os.name == "nt":
                    # Exercise the real installed launcher, not a fake CLI.
                    # The spy only records process creation; calls remain real.
                    for cancelled in (False, True):
                        bounded = context.bounded(15 if cancelled else .15)
                        processes = []
                        native_popen = subprocess.Popen
                        timer = None
                        def start(*arguments, **kwargs):
                            nonlocal timer
                            process = native_popen(*arguments, **kwargs)
                            # A prior timeout may still be reaping its process.
                            # Capture only the CLI launch, not taskkill's helper,
                            # and cancel after this invocation really starts.
                            if not processes and "env" in kwargs:
                                processes.append(process)
                                if cancelled:
                                    timer = threading.Timer(.15, bounded.budget.cancelled.set)
                                    timer.start()
                            return process
                        code = "completed"
                        try:
                            with patch("ai.src.runtime.cli.subprocess.Popen", side_effect=start):
                                query(["query", "teach"], bounded)
                        except RuntimeFault as error:
                            code = error.code
                        finally:
                            if timer:
                                timer.cancel()
                        if processes:
                            try:
                                processes[0].wait(timeout=5)
                            except subprocess.TimeoutExpired:
                                pass
                        label = "cancelled" if cancelled else "deadline"
                        result.setdefault("lifecycle", {})[label] = {
                            "code": code, "started": bool(processes),
                            "reaped": bool(processes) and processes[0].poll() is not None}
                        result["checks"]["windows_" + label] = (
                            code == label and bool(processes) and processes[0].poll() is not None)
                result["state"] = "finished"
                result["passed"] = all(result["checks"].values())
        except Exception as error:
            result.update(state="failed", error=type(error).__name__)
            if isinstance(error, RuntimeFault):
                result["error_code"] = error.code
        save()
        print(json.dumps({k: result[k] for k in ("state", "version", "checks", "model_calls", "error") if k in result}, ensure_ascii=False))
        return 0 if result.get("passed") else 1


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
