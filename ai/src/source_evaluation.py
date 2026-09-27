"""Fixed source questions and offline, human-reviewed scoring.

Mechanical evidence checks do not grade meaning. Neither a model judge nor
keyword matching can turn an unreviewed answer into an accuracy pass.
"""
import fnmatch
import hashlib
import json
import math
from pathlib import Path, PurePosixPath
import re
import statistics

from .runtime.filesystem import SafeRoot
from .tools.source import public_path

SUITE_PATH = Path(__file__).resolve().parents[1] / "evals" / "source-questions.json"
GAME_SUITE_PATH = SUITE_PATH.with_name("game-source-questions.json")
GAME_DICTIONARY_SUITE_PATH = SUITE_PATH.with_name("game-source-questions-v2.json")


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                     separators=(",", ":")).encode("utf-8")).hexdigest()


def load_suite(path=SUITE_PATH):
    suite = json.loads(Path(path).read_text(encoding="utf-8"))
    if suite["version"] != 1 or len(suite["cases"]) < 20:
        raise ValueError("invalid_evaluation_suite")
    repository_files = suite.get("repository_files", {})
    if suite.get("kind") == "repository" and not repository_files:
        raise ValueError("missing_repository_files")
    for item in repository_files.values():
        if not re.fullmatch(r"[0-9a-f]{64}", item["hash"]) or type(item["lines"]) is not int or item["lines"] < 1:
            raise ValueError("invalid_repository_snapshot")
    names = set()
    for case in suite["cases"]:
        if case["name"] in names or case["expected"] not in ("completed", "needs_input", "incomplete"):
            raise ValueError("invalid_evaluation_case")
        names.add(case["name"])
        fixture = suite["fixtures"][case["fixture"]]
        files = repository_files or fixture["files"]
        for name in files:
            path = PurePosixPath(name)
            if path.is_absolute() or ".." in path.parts or "\\" in name or ":" in name or not public_path(name):
                raise ValueError("invalid_fixture_path")
        criteria = case["criteria"]
        if not criteria or len({item["id"] for item in criteria}) != len(criteria):
            raise ValueError("invalid_evaluation_criteria")
        for criterion in criteria:
            if not criterion["text"] or (not criterion["evidence"] and case["expected"] != "needs_input"):
                raise ValueError("empty_evaluation_criteria")
            for evidence in criterion["evidence"]:
                name = evidence["path"]
                line_count = repository_files[name]["lines"] if repository_files else len(files[name].splitlines())
                if (any(fnmatch.fnmatchcase(name, pattern) for pattern in fixture["exclude"])
                        or not 1 <= evidence["start"] <= evidence["end"] <= line_count):
                    raise ValueError("invalid_gold_evidence")
    return suite


def repository_snapshot(suite, root):
    """Read only the pinned public file list, never enumerate the repository.

    This is a trusted local evaluation setup, not a model-visible read tool.
    The model later sees only temporary copies through the normal source tools.
    """
    source = SafeRoot(Path(root).absolute())
    files = {}
    for name, expected in suite["repository_files"].items():
        if not public_path(name):
            raise ValueError("invalid_fixture_path")
        data = source.read(name)
        content = data.decode("utf-8")
        if (hashlib.sha256(data).hexdigest() != expected["hash"]
                or len(content.splitlines()) != expected["lines"]):
            raise ValueError("evaluation_source_changed")
        files[name] = content
    return files


def probe_cases(suite, only=None, *, repository_root=None):
    """Expected answers stay in reporting metadata, never in Agent input."""
    cases = []
    files = None
    if suite.get("kind") == "repository":
        if repository_root is None:
            raise ValueError("repository_root_required")
        files = repository_snapshot(suite, repository_root)
    for case in suite["cases"]:
        if only is not None and case["name"] != only:
            continue
        fixture = suite["fixtures"][case["fixture"]]
        cases.append({**case, **fixture, **({"files": files, "revision": suite["name"]} if files is not None else {}),
                      "criteria": [item["text"] for item in case["criteria"]],
                      "required_files": sorted({e["path"] for c in case["criteria"] for e in c["evidence"]})})
    if not cases:
        raise ValueError("unknown_case")
    return cases


def report_cases(report, suite):
    synthetic = suite.get("kind") != "repository"
    if report.get("suite_digest") != digest(suite) or report.get("synthetic_only") is not synthetic:
        raise ValueError("evaluation_suite_mismatch")
    names = {item["name"] for item in suite["cases"]}
    cases = report.get("cases", [])
    if len({item["case"] for item in cases}) != len(cases) or any(item["case"] not in names for item in cases):
        raise ValueError("invalid_report_cases")
    return {item["case"]: item for item in cases}


def review_template(report, suite):
    cases = report_cases(report, suite)
    return {"suite_digest": digest(suite), "report_digest": digest(report), "reviewer": "",
            "instructions": "逐题对照题集指定源码与标准结论，核对全文、引用与终态；填写 true/false 和冒充事实的无依据结论数。"
                            "缺资料时明确标注且不违背已知证据的推断不计入该数，也不补齐必要证据或玩家状态。"
                            "标为推测却与证据矛盾、后文将假设肯定化，仍判错误；不能只审核带证据段落。"
                            "静态核对不等于实服验收，不要运行模型代填人工审核。",
            "cases": [{"case": case["name"], "gold_verified": None,
                       "criteria": {item["id"]: None for item in case["criteria"]},
                       "unsupported_claims": None, "notes": ""}
                      for case in suite["cases"] if case["name"] in cases]}


def evidence_gaps(result, case, fixture, repository_files=None):
    """Check actual cited read ranges/hash, not merely files visited by a search."""
    investigation = result.get("investigation") or {}
    cited = set(investigation.get("entry", ()))
    # Offline scoring also accepts pre-v9 reports; new runtime results have no checks.
    for item in (*result.get("claims", ()), *investigation.get("checks", ())):
        cited.update(item.get("evidence", ()))
    read_lines, read_columns = {}, {}
    snapshots = repository_files or {
        name: {"hash": hashlib.sha256(content.encode("utf-8")).hexdigest(), "lines": len(content.splitlines())}
        for name, content in fixture["files"].items()}
    for item in result.get("evidence", ()):
        name = item["path"]
        # Keep scoring historical reports; both forms still require the pinned
        # snapshot hash, allowed file and original read range below.
        if (item["id"] not in cited or item.get("scope") not in {"probe_rules", "repository"}
                or name not in snapshots):
            continue
        if (item.get("hash") != snapshots[name]["hash"]
                or any(fnmatch.fnmatchcase(name, pattern) for pattern in fixture["exclude"])
                or not 1 <= item["start"] <= item["end"] <= snapshots[name]["lines"]):
            continue
        if "start_column" in item or "end_column" in item:
            if (item["start"] == item["end"] and type(item.get("start_column")) is int
                    and type(item.get("end_column")) is int
                    and 1 <= item["start_column"] <= item["end_column"]):
                read_columns.setdefault((name, item["start"]), []).append(
                    (item["start_column"], item["end_column"]))
        else:
            read_lines.setdefault(name, set()).update(range(item["start"], item["end"] + 1))
    def covered(evidence):
        if set(range(evidence["start"], evidence["end"] + 1)) <= read_lines.get(evidence["path"], set()):
            return True
        return (evidence["start"] == evidence["end"] and "start_column" in evidence
                and "end_column" in evidence and any(
                    start <= evidence["start_column"] <= evidence["end_column"] <= end
                    for start, end in read_columns.get((evidence["path"], evidence["start"]), ())))
    return [criterion["id"] for criterion in case["criteria"]
            if any(not covered(e) for e in criterion["evidence"])]


def score_report(report, suite, review=None):
    results = report_cases(report, suite)
    review = review if review is not None else review_template(report, suite)
    if review.get("suite_digest") != digest(suite) or review.get("report_digest") != digest(report):
        raise ValueError("stale_review")
    reviewed = {item["case"]: item for item in review["cases"]}
    if len(reviewed) != len(review["cases"]) or set(reviewed) != set(results):
        raise ValueError("invalid_review_cases")
    rows = []
    for case in suite["cases"]:
        name = case["name"]
        if name not in results:
            rows.append({"case": name, "review_complete": False, "passed": False, "reason": "not_run"})
            continue
        result, assessment = results[name], reviewed[name]
        criteria = {item["id"] for item in case["criteria"]}
        labels = assessment.get("criteria", {})
        unsupported = assessment.get("unsupported_claims")
        complete = (isinstance(review.get("reviewer"), str) and bool(review["reviewer"].strip())
                    and assessment.get("gold_verified") is True and set(labels) == criteria
                    and all(type(value) is bool for value in labels.values())
                    and type(unsupported) is int and unsupported >= 0)
        gaps = evidence_gaps(result, case, suite["fixtures"][case["fixture"]], suite.get("repository_files"))
        status_matches = result["status"] == case["expected"]
        passed = complete and status_matches and not gaps and all(labels.values()) and unsupported == 0
        rows.append({"case": name, "status": result["status"], "expected": case["expected"],
                     "status_matches": status_matches, "missing_evidence": gaps,
                     "review_complete": complete, "passed": passed,
                     "unsupported_claims": unsupported if complete else None,
                     "criteria": labels, "notes": assessment.get("notes", ""),
                     "elapsed_s": result["elapsed_s"], "model_calls": result["budget"]["model_calls"],
                     "delegations": result.get("delegation_count", 0),
                     "runs": [{key: run[key] for key in ("run_id", "parent_id", "agent", "delegation_depth",
                                "status", "calls", "context_peak_tokens_estimated") if key in run}
                              for run in result.get("runs", [])],
                     "compactions": len(result.get("compactions", ()))})
    review_complete = all(row["review_complete"] for row in rows)
    passed = sum(row["passed"] for row in rows)
    answerable = {case["name"] for case in suite["cases"] if case["expected"] == "completed"}
    completed = sum(results[name]["status"] == "completed" for name in answerable if name in results)
    reviewed_rows = [row for row in rows if row["review_complete"]]
    latency = sorted(item["elapsed_s"] for item in results.values())
    cost = dict(report.get("cost", {}))
    total_cost = cost.get("estimated_total_cost")
    cost.update(successful_tasks=passed if review_complete else None,
                cost_per_successful_task=total_cost / passed
                if review_complete and passed and total_cost is not None else None)
    return {"suite": suite["name"], "suite_digest": digest(suite), "report_digest": digest(report),
            "route": report.get("route", "direct"),
            "source_access": report.get("source_access"),
            "model_configuration": {key: report.get(key) for key in (
                "model", "max_tokens", "context_window_tokens", "model_options_fingerprint")},
            "reviewer": review.get("reviewer", ""), "human_review_complete": review_complete,
            "acceptance_passed": report.get("state") == "finished" and review_complete and passed == len(rows),
            "total_cases": len(rows), "run_cases": len(results), "reviewed_cases": len(reviewed_rows),
            "passed_cases": passed, "accuracy": passed / len(rows) if review_complete else None,
            "answerable_cases": len(answerable), "completed_answerable_cases": completed,
            "completion_rate": completed / len(answerable),
            "unsupported_claim_cases": sum(row["unsupported_claims"] > 0 for row in reviewed_rows),
            "unsupported_claim_rate": sum(row["unsupported_claims"] > 0 for row in reviewed_rows) / len(rows)
            if review_complete else None,
            "latency_s": {"total": sum(latency), "mean": statistics.mean(latency) if latency else None,
                          "p95": latency[max(0, math.ceil(len(latency) * .95) - 1)] if latency else None},
            "model_calls": sum(item["budget"]["model_calls"] for item in results.values()),
            "compactions": sum(len(item.get("compactions", ())) for item in results.values()),
            "usage": report.get("total", {}), "cost": cost, "cases": rows,
            "scope": "repository_snapshot_quality_not_live_game_state" if suite.get("kind") == "repository"
            else "synthetic_fixture_quality_only_not_actual_game_acceptance"}


def compare_reports(direct, coordinated, suite, *, reviews=(None, None)):
    """Compare observations, never infer equal quality from lower consumption."""
    if len(reviews) != 2:
        raise ValueError("comparison_reviews_mismatch")
    if direct.get("route") != "direct" or coordinated.get("route") != "coordinated":
        raise ValueError("comparison_route_mismatch")
    if direct.get("source_access") != coordinated.get("source_access"):
        raise ValueError("comparison_source_access_mismatch")
    configuration = ("model", "max_tokens", "context_window_tokens", "model_options_fingerprint")
    fingerprint = direct.get("model_options_fingerprint")
    if (not isinstance(fingerprint, str) or not re.fullmatch(r"[0-9a-f]{64}", fingerprint)
            or any(direct.get(key) is None or direct[key] != coordinated.get(key) for key in configuration)):
        raise ValueError("comparison_model_mismatch")
    left, right = report_cases(direct, suite), report_cases(coordinated, suite)
    if not left or set(left) != set(right):
        raise ValueError("comparison_cases_mismatch")
    scores = {route: score_report(report, suite, review)
              for route, report, review in zip(("direct", "coordinated"), (direct, coordinated), reviews)}
    return {"suite_digest": digest(suite), "model_configuration": {key: direct[key] for key in configuration},
            "equal_quality_verified": all(score["acceptance_passed"] for score in scores.values()),
            "note": "同一题单与声明模型配置的观测对照；未完整人工验收不推断等质或成本收益。"
                    "上下文峰值为运行时计量值，不是累计 token；父账本已含子过程，不重复相加。",
            "variants": scores,
            "cases": [{"case": name,
                       **{route: {"status": case["status"], "elapsed_s": case["elapsed_s"],
                                  "model_calls": case["budget"]["model_calls"],
                                  "delegations": case.get("delegation_count", 0),
                                  "usage": case["budget"].get("usage", {}),
                                  "usage_unknown": case["budget"].get("usage_unknown", {}),
                                  "cost": case.get("cost", {})}
                          for route, case in (("direct", left[name]), ("coordinated", right[name]))}}
                      for name in left]}
