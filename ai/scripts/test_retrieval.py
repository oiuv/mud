#!/usr/bin/env python3
"""交互查看知识库召回；默认复用游戏混合检索，--bm25 完全离线。"""
import argparse
import json
import logging
import math
from pathlib import Path
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.knowledge_basic import BasicKnowledgeSystem
from src.knowledge_qwen import QwenKnowledgeSystem
from src.settings import load_settings


PREVIEW_CHARS = 600


def top_k(value):
    number = int(value)
    if not 1 <= number <= 500:
        raise argparse.ArgumentTypeError("返回条数必须在 1 到 500 之间")
    return number


def threshold_value(value):
    number = float(value)
    if not math.isfinite(number) or not 0 <= number <= 1:
        raise argparse.ArgumentTypeError("阈值必须是 0 到 1 之间的有限数值")
    return number


def resolve_threshold(args, settings):
    threshold = 0.4
    if args.npc:
        roles = json.loads(settings.roles_file.read_text(encoding="utf-8"))
        role = roles.get(args.npc) if isinstance(roles, dict) else None
        if not isinstance(role, dict):
            raise ValueError(f"找不到 NPC 配置：{args.npc}")
        threshold = role.get("knowledge_threshold", 0.4)
        if not isinstance(threshold, (int, float)) or not math.isfinite(threshold) or not 0 <= threshold <= 1:
            raise ValueError(f"NPC 的 knowledge_threshold 无效：{args.npc}")
    return threshold if args.threshold is None else args.threshold


def display_results(query, results, elapsed, bm25=False, full=False):
    print(f"\n问题：{query}")
    print(f"召回 {len(results)} 条，耗时 {elapsed * 1000:.2f} ms")
    if not results:
        print("没有召回相关资料。")
        return
    source_names = {"bm25": "BM25", "vector": "向量"}
    for rank, result in enumerate(results, 1):
        sources = result.get("sources", ["bm25"] if bm25 else [])
        print(f"\n[{rank}] {result['title']}")
        print(f"文件：{result['filename']}")
        print(f"文档块：{result['id']}")
        print("召回来源：" + " + ".join(source_names.get(source, source) for source in sources))
        scores = []
        if not bm25:
            scores.append(f"RRF={result['score']:.6f}")
        for key, label in (("bm25_score", "BM25"), ("vector_score", "向量余弦"),
                           ("rerank_score", "重排")):
            if key in result:
                scores.append(f"{label}={result[key]:.6f}")
        print("分数：" + "，".join(scores))
        content = result["content"]
        print("正文：")
        print(content if full else content[:PREVIEW_CHARS])
        if not full and len(content) > PREVIEW_CHARS:
            print(f"…（显示前 {PREVIEW_CHARS}/{len(content)} 字；--full 显示整个文档块）")


def search_and_display(query, basic, knowledge, settings, args, threshold):
    if not query.strip():
        raise ValueError("问题不能为空")
    if len(query) > settings.max_message_chars:
        raise ValueError(f"问题超过游戏限制：最多 {settings.max_message_chars} 字符")
    started = time.monotonic()
    limit = args.top_k if args.top_k is not None else settings.retrieval_top_k
    if threshold >= 1:
        results = []
    elif args.bm25:
        results = basic.search(query, limit)
    else:
        results = knowledge.hybrid_search(
            query, limit=limit, threshold=threshold,
            deadline=started + settings.request_timeout,
        )
    display_results(query, results, time.monotonic() - started, args.bm25, args.full)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("query", nargs="?", help="单次问题；省略后进入连续输入模式")
    parser.add_argument("--bm25", action="store_true", help="仅使用本地 BM25，不调用远程 API")
    parser.add_argument("--npc", help="使用该 NPC 的 knowledge_threshold，例如 \"li bai\"")
    parser.add_argument("--threshold", type=threshold_value, help="覆盖向量阈值，默认 0.4；1 禁用全部召回")
    parser.add_argument("--top-k", type=top_k, help="显示条数，默认读取 RETRIEVAL_TOP_K")
    parser.add_argument("--full", action="store_true", help="显示命中文档块的完整正文")
    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.WARNING, format="%(levelname)s: %(message)s")
    knowledge = None
    try:
        settings = load_settings()
        threshold = resolve_threshold(args, settings)
        # Reuse the service corpus; only an empty local corpus is built automatically.
        basic = BasicKnowledgeSystem(settings=settings)
        stats = basic.get_stats()
        if not stats["total_documents"]:
            raise ValueError("知识库为空，请运行 scripts/update_knowledge.py 或检查 HELP_DIR")
        print("模式：" + ("本地 BM25（离线）" if args.bm25 else "混合检索（BM25 + 向量，按配置重排）"))
        print(f"知识库：{stats['source_files']} 个文件，{stats['total_documents']} 个文档块")
        print(f"NPC：{args.npc or '未指定'}；向量阈值：{threshold:g}")
        if threshold >= 1:
            print("阈值为 1，按游戏规则禁用全部知识召回。")
        if not args.bm25:
            knowledge = QwenKnowledgeSystem(settings=settings, basic=basic)
            print(f"向量模型：{settings.embedding_model}")
            print(f"重排模型：{settings.rerank_model if settings.rerank_enabled else '已关闭'}")
            print("混合模式按 .env 配置调用向量/重排 API；不会调用问答模型或生成文档向量。")
            if not settings.dashscope_api_key:
                print("提示：未配置 DASHSCOPE_API_KEY，将使用本地召回。")
            elif not knowledge.get_stats()["indexed_vectors"]:
                print("提示：当前模型没有文档向量，将使用 BM25 召回；可先运行 scripts/update_knowledge.py。")
        print("分数不可跨类型比较；有重排分数时按重排排序，否则混合模式按 RRF 排序。")
        if args.query is not None:
            search_and_display(args.query.strip(), basic, knowledge, settings, args, threshold)
            return 0
        print("连续输入问题；/quit 或 /exit 退出，Ctrl+C 也可退出。")
        while True:
            query = input("\n问题> ").strip()
            if query.lower() in ("/quit", "/exit"):
                return 0
            if not query:
                continue
            try:
                search_and_display(query, basic, knowledge, settings, args, threshold)
            except Exception as error:
                print(f"检索失败（{type(error).__name__}）：{error}", file=sys.stderr)
    except (EOFError, KeyboardInterrupt):
        print()
        return 0
    except Exception as error:
        print(f"检索失败（{type(error).__name__}）：{error}", file=sys.stderr)
        return 1
    finally:
        if knowledge is not None and knowledge.client is not None:
            knowledge.client.close()


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    raise SystemExit(main())
