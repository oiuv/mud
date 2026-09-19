#!/usr/bin/env python3
"""Build the local BM25 corpus. No remote API calls."""
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.knowledge_basic import BasicKnowledgeSystem
from src.settings import load_settings


def main():
    try:
        knowledge = BasicKnowledgeSystem(settings=load_settings())
        knowledge.process_files()
        print(json.dumps(knowledge.get_stats(), ensure_ascii=False, indent=2))
        return 0
    except Exception as error:
        print(f"BM25初始化失败: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
