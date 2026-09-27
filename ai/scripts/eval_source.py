"""效果评测：真实源码固定题；默认预览，授权运行后审阅计分。"""
import argparse
from contextlib import nullcontext
import json
import logging
from pathlib import Path
import sys
import threading

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ai.scripts.verify_source_agent import run_cases
from ai.src.runtime.lifecycle import error_code
from ai.src.settings import load_settings
from ai.src.source_evaluation import (GAME_DICTIONARY_SUITE_PATH, GAME_SUITE_PATH, SUITE_PATH,
                                      digest, load_suite, probe_cases,
                                      repository_snapshot, review_template, score_report, compare_reports)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument("--execute", action="store_true", help="本批固定题实际调用模型，不修改游戏源码或数据")
    modes.add_argument("--check-sources", action="store_true", help="仅本机核对真实题集的文件hash/行数，不调用模型")
    modes.add_argument("--review-template", type=Path, metavar="RUN", help="为运行报告生成待人工填写的审核表")
    modes.add_argument("--score", type=Path, metavar="RUN", help="只读离线计分，不调用模型")
    modes.add_argument("--compare", type=Path, nargs=2, metavar=("DIRECT", "COORDINATED"),
                       help="离线对照同题同模型的直达/协调原始报告，不重新调用模型")
    parser.add_argument("--review", type=Path, help="人工填写的审核表，仅用于 --score")
    parser.add_argument("--reviews", type=Path, nargs=2, help="两份对应的人工审核表，仅用于 --compare")
    parser.add_argument("--report", type=Path, help="新输出文件；不覆盖已有报告，不自动重跑")
    parser.add_argument("--case", help="仅运行指定题；子集不能通过整套验收")
    parser.add_argument("--route", choices=("direct", "coordinated"), default="direct",
                        help="默认直接 NPC；coordinated 走真实主 Agent，由其按需委派，不改变正式配置")
    parser.add_argument("--suite", choices=("game", "game-dictionary", "synthetic"), default="game",
                        help="game 为原16文件题集；game-dictionary 补入公共字典；synthetic 仅合成回归")
    parser.add_argument("--repository", type=Path, default=Path(__file__).resolve().parents[2],
                        help="本机仓库根目录；只读题集中固定的公开文件清单")
    parser.add_argument("--allow-source-egress", action="store_true",
                        help="显式确认真实题集中列明的源码允许外发给已配置模型；不开放其他目录")
    parser.add_argument("--codegraph", action="store_true", help="仅为隔离源码快照建 CodeGraph 索引并启用；不改正式配置")
    options = parser.parse_args(argv)
    if options.review and not options.score:
        parser.error("--review 只用于 --score")
    if options.reviews and not options.compare:
        parser.error("--reviews 只用于 --compare")
    if options.case and (options.score or options.review_template or options.compare):
        parser.error("离线审核/计分不能指定 --case")
    suite = load_suite({"game": GAME_SUITE_PATH, "game-dictionary": GAME_DICTIONARY_SUITE_PATH,
                        "synthetic": SUITE_PATH}[options.suite])
    synthetic = options.suite == "synthetic"
    cases = [item for item in suite["cases"] if options.case is None or item["name"] == options.case]
    if not cases:
        parser.error("未知题目")
    if options.check_sources:
        if synthetic:
            parser.error("合成题无需读取仓库")
        files = repository_snapshot(suite, options.repository)
        print(json.dumps({"mode": "source_check", "files": len(files), "questions": len(cases),
                          "source_snapshot_matches": True, "model_calls": 0}, ensure_ascii=False))
        return 0
    if not (options.execute or options.score or options.review_template or options.compare):
        print(json.dumps({"mode": "preview", "route": options.route, "synthetic_only": synthetic, "model_calls": 0,
                          "suite_digest": digest(suite), "gold_review_status": suite["review_status"],
                          "source_files": list(suite.get("repository_files", {})),
                          "cases": [{"name": item["name"], "expected": item["expected"]} for item in cases]},
                         ensure_ascii=False))
        return 0
    if options.execute and not synthetic and not options.allow_source_egress:
        parser.error("真实题执行需要 --allow-source-egress 确认固定源码清单的外发授权")
    if options.report is None:
        parser.error("必须指定新的 --report 路径")
    # Reserve before settings/provider access; an interrupted batch is never
    # silently resubmitted. No source file is read until its local/egress mode
    # has been explicitly chosen above; gold answers never enter model input.
    with (options.report.open("x", encoding="utf-8") as stream,
          (Path(str(options.report) + ".events.jsonl").open("x", encoding="utf-8")
           if options.execute else nullcontext()) as journal):
        report_lock = threading.Lock()
        partial = {"state": "started", "route": options.route, "suite_digest": digest(suite),
                   "synthetic_only": synthetic, "cases": [],
                   "source_access": {"mode": "pinned_snapshot", "policy_version": "repository-source-v2"}}
        def save(value):
            with report_lock:
                stream.seek(0)
                json.dump(value, stream, ensure_ascii=False, indent=2)
                stream.truncate()
                stream.flush()
        save(partial)
        if options.compare:
            reports = [json.loads(path.read_text(encoding="utf-8")) for path in options.compare]
            reviews = ([json.loads(path.read_text(encoding="utf-8")) for path in options.reviews]
                       if options.reviews else [None, None])
            value = compare_reports(*reports, suite, reviews=reviews)
            save(value)
            print(json.dumps({"mode": "compare", "equal_quality_verified": value["equal_quality_verified"],
                              "model_calls": 0}), flush=True)
            return 0
        if options.score or options.review_template:
            report = json.loads((options.score or options.review_template).read_text(encoding="utf-8"))
            review = json.loads(options.review.read_text(encoding="utf-8")) if options.review else None
            value = score_report(report, suite, review) if options.score else review_template(report, suite)
            save(value)
            print(json.dumps({"mode": "score" if options.score else "review_template",
                              "human_review_complete": value.get("human_review_complete", False),
                              "acceptance_passed": value.get("acceptance_passed", False)}, ensure_ascii=False))
            return 0
        logging.basicConfig(level=logging.WARNING)
        def on_case(case, total):
            partial.pop("inflight", None)
            partial["cases"].append(case)
            partial["total"] = total
            save(partial)
            print(json.dumps({key: case[key] for key in ("case", "status", "elapsed_s")}), flush=True)
        def on_progress(value):
            journal.write(json.dumps(value, ensure_ascii=False) + "\n")
            journal.flush()
            partial["inflight"] = value
            save(partial)
            print(json.dumps(value, ensure_ascii=False), flush=True)
        try:
            cases = probe_cases(suite, options.case, repository_root=options.repository if not synthetic else None)
            settings = load_settings()
            settings.codegraph_enabled = options.codegraph
            result = run_cases(settings, cases=cases, on_case=on_case, synthetic_only=synthetic,
                               route=options.route,
                               on_progress=on_progress,
                               cancel_requested=lambda: Path(str(options.report) + ".cancel").exists())
        except (Exception, KeyboardInterrupt) as error:
            partial.update(state="interrupted", code="cancelled" if isinstance(error, KeyboardInterrupt)
                           else error_code(error, "evaluation_failed"))
            save(partial)
            return 1
        result.update(state="interrupted" if result.get("interrupted") else "finished",
                      suite_digest=digest(suite), suite=suite["name"])
        save(result)
        print(json.dumps({"state": result["state"], "human_review_required": True,
                          "model_calls": result["total"]["model_calls"]}), flush=True)
    return 1 if result.get("interrupted") else 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
