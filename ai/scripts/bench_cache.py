#!/usr/bin/env python3
"""性能基准：查询向量缓存；直接运行会调用配置的远程向量 API。"""
import json
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.knowledge_qwen import QwenKnowledgeSystem
from src.settings import load_settings
from src.diagnostics import RetrievalDiagnostic
from src.runtime.context import Budget, Limits
from src.usage_report import usage_report


def main():
    settings = load_settings()
    if not settings.dashscope_api_key:
        print("请先配置 DASHSCOPE_API_KEY 并运行 ops_build_vectors.py")
        return 1
    knowledge = QwenKnowledgeSystem(settings=settings)
    try:
        budget = Budget(Limits(depth=0))
        diagnostic = RetrievalDiagnostic(knowledge, mode="vector", budget=budget)
        for run in range(3):
            started = time.perf_counter()
            for query in ("武当拜师", "少林武功", "扬州地图"):
                diagnostic.search(query, limit=5)
            print(f"Round {run + 1}: {(time.perf_counter() - started) * 1000:.2f} ms")
        print(json.dumps(dict(knowledge.get_stats(), budget=budget.snapshot(), cost=usage_report(budget.snapshot(),
                              settings.model_prices_per_million, settings.cost_currency)), ensure_ascii=False, indent=2))
        return 0
    except Exception as error:
        print(f"缓存诊断失败（{type(error).__name__}）", file=sys.stderr)
        return 1
    finally:
        knowledge.close()


if __name__ == "__main__":
    raise SystemExit(main())
