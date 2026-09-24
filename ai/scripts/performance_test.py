#!/usr/bin/env python3
"""Benchmark local BM25; pass --remote to call configured embedding/rerank APIs."""
import argparse
import json
import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.knowledge_basic import BasicKnowledgeSystem
from src.knowledge_qwen import QwenKnowledgeSystem
from src.settings import load_settings

QUERIES = ["丐帮如何拜师", "九阳神功", "扬州地图", "新手入门", "武当派", "怎么赚钱"]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--remote", action="store_true")
    args = parser.parse_args()
    settings = load_settings()
    basic = BasicKnowledgeSystem(settings=settings)
    search = QwenKnowledgeSystem(settings=settings, basic=basic).hybrid_search if args.remote else basic.search
    durations = []
    for query in QUERIES:
        started = time.perf_counter()
        results = search(query)
        elapsed = (time.perf_counter() - started) * 1000
        durations.append(elapsed)
        print(f"{query}: {elapsed:.2f} ms, {len(results)} results")
    print(json.dumps(dict(basic.get_stats(), average_ms=sum(durations) / len(durations)),
                     ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
