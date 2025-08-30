#!/usr/bin/env python3
"""
多轮缓存效果测试脚本
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from knowledge_qwen import qwen_knowledge
import time

def test_cache_performance():
    """测试缓存性能 - 多轮多查询"""
    print("🧪 多轮缓存性能测试...")

    # 测试查询列表
    test_queries = [
        '丐帮', '九阳神功', '如何拜师', '扬州地图', '新手入门',
        '武当派', '结婚系统', '武功修炼', '赚钱方法', '门派选择'
    ]

    # 第一轮：全部缓存未命中
    print("\n=== 第一轮：缓存未命中 ===")
    first_round_times = []
    for query in test_queries:
        start = time.time()
        results = qwen_knowledge.semantic_search(query, limit=3)
        duration = (time.time() - start) * 1000
        first_round_times.append(duration)
        print(f"  {query}: {duration:.1f}ms, 找到{len(results)}条")

    # 第二轮：全部缓存命中
    print("\n=== 第二轮：缓存命中 ===")
    second_round_times = []
    for query in test_queries:
        start = time.time()
        results = qwen_knowledge.semantic_search(query, limit=3)
        duration = (time.time() - start) * 1000
        second_round_times.append(duration)
        print(f"  {query}: {duration:.1f}ms, 找到{len(results)}条")

    # 第三轮：确认缓存效果
    print("\n=== 第三轮：确认缓存 ===")
    third_round_times = []
    for query in test_queries:
        start = time.time()
        results = qwen_knowledge.semantic_search(query, limit=3)
        duration = (time.time() - start) * 1000
        third_round_times.append(duration)
        print(f"  {query}: {duration:.1f}ms, 找到{len(results)}条")

    # 性能对比
    print("\n=== 性能对比 ===")
    avg_first = sum(first_round_times) / len(first_round_times)
    avg_second = sum(second_round_times) / len(second_round_times)
    avg_third = sum(third_round_times) / len(third_round_times)

    print(f"第一轮平均: {avg_first:.1f}ms")
    print(f"第二轮平均: {avg_second:.1f}ms")
    print(f"第三轮平均: {avg_third:.1f}ms")

    if avg_second < avg_first:
        improvement = ((avg_first - avg_second) / avg_first) * 100
        print(f"缓存加速: {improvement:.1f}%")

    # 完整统计信息
    print("\n=== 完整统计信息 ===")
    stats = qwen_knowledge.get_stats()

    print(f"📊 数据规模:")
    print(f"   文档总数: {stats['total_documents']}")
    print(f"   分类数量: {stats['total_categories']}")
    print(f"   分类分布: {stats['category_distribution']}")

    print(f"🎯 缓存统计:")
    cache_stats = stats['cache_stats']
    print(f"   总查询: {cache_stats['total']}")
    print(f"   缓存命中: {cache_stats['hits']}")
    print(f"   缓存未命中: {cache_stats['misses']}")
    print(f"   命中率: {cache_stats['hit_rate_percent']}%")

    print(f"⚙️ 模型信息:")
    print(f"   模型: {stats['model']}")
    print(f"   维度: {stats['dimensions']}")

if __name__ == "__main__":
    test_cache_performance()
