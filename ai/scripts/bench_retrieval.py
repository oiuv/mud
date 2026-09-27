#!/usr/bin/env python3
"""性能基准：默认本地 BM25；--remote 才调用向量和重排 API。"""
import argparse
import json
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.knowledge_basic import BasicKnowledgeSystem
from src.knowledge_qwen import QwenKnowledgeSystem
from src.settings import load_settings
from src.diagnostics import RetrievalDiagnostic
from src.runtime.context import Budget, Limits
from src.usage_report import usage_report

QUERIES = ["丐帮如何拜师", "九阳神功", "扬州地图", "新手入门", "武当派", "怎么赚钱"]


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--remote", action="store_true")
    args = parser.parse_args(argv)
    settings = load_settings()
    basic = BasicKnowledgeSystem(settings=settings)
    knowledge = QwenKnowledgeSystem(settings=settings, basic=basic) if args.remote else None
    try:
        budget = Budget(Limits(depth=0))
        diagnostic = RetrievalDiagnostic(knowledge or basic, mode="hybrid" if args.remote else "bm25",
                                         budget=budget)
        durations = []
        for query in QUERIES:
            started = time.perf_counter()
            value, _ = diagnostic.search(query)
            elapsed = (time.perf_counter() - started) * 1000
            durations.append(elapsed)
            print(f"{query}: {elapsed:.2f} ms, {len(value['evidence'])} results"
                  + ("（部分结果）" if value["truncated"] else ""))
        print(json.dumps(dict(basic.get_stats(), average_ms=sum(durations) / len(durations),
                              budget=budget.snapshot(), cost=usage_report(budget.snapshot(),
                              settings.model_prices_per_million, settings.cost_currency)), ensure_ascii=False, indent=2))
        return 0
    except Exception as error:
        print(f"性能诊断失败（{type(error).__name__}）", file=sys.stderr)
        return 1
    finally:
        if knowledge is not None:
            knowledge.close()


if __name__ == "__main__":
    raise SystemExit(main())
