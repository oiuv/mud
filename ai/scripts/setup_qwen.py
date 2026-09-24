#!/usr/bin/env python3
"""Build/rebuild local chunks and missing vectors for the configured model."""
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.knowledge_qwen import QwenKnowledgeSystem
from src.settings import load_settings


def main():
    settings = load_settings()
    if not settings.dashscope_api_key:
        print("请在 ai/.env 配置 DASHSCOPE_API_KEY", file=sys.stderr)
        return 1
    try:
        knowledge = QwenKnowledgeSystem(settings=settings)
        knowledge.process_files()
        print(json.dumps(knowledge.get_stats(), ensure_ascii=False, indent=2))
        return 0
    except Exception as error:
        print(f"向量初始化失败 ({type(error).__name__})，旧索引保留；可继续使用BM25。", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
