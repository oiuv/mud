#!/usr/bin/env python3
"""Measure query-vector cache; calls the configured remote embedding API."""
import json
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.knowledge_qwen import QwenKnowledgeSystem
from src.settings import load_settings


def main():
    settings = load_settings()
    if not settings.dashscope_api_key:
        print("请先配置 DASHSCOPE_API_KEY 并运行 setup_qwen.py")
        return 1
    knowledge = QwenKnowledgeSystem(settings=settings)
    for run in range(3):
        started = time.perf_counter()
        for query in ("武当拜师", "少林武功", "扬州地图"):
            knowledge.semantic_search(query)
        print(f"Round {run + 1}: {(time.perf_counter() - started) * 1000:.2f} ms")
    print(json.dumps(knowledge.get_stats(), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
