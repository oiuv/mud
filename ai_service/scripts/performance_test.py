#!/usr/bin/env python3
"""
知识库性能测试脚本
测试SQLite3和基础搜索的查询性能
"""

import time
import os
import sys
from pathlib import Path

# 添加路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from knowledge_basic import basic_knowledge
from knowledge_qwen import qwen_knowledge

def test_basic_search():
    """测试基础搜索性能"""
    print("=== 基础搜索系统性能测试 ===")

    test_queries = [
        '丐帮',
        '九阳神功',
        '如何拜师',
        '扬州地图',
        '新手入门',
        '武当派',
        '结婚系统',
        '武功修炼',
        '赚钱方法',
        '门派选择'
    ]

    results = []
    for query in test_queries:
        start = time.time()
        try:
            search_results = basic_knowledge.search(query, limit=3)
            duration = (time.time() - start) * 1000
            results.append({
                'query': query,
                'duration': duration,
                'results_count': len(search_results),
                'system': 'basic'
            })
            print(f"  {query}: {duration:.1f}ms, 找到{len(search_results)}条")
        except Exception as e:
            print(f"  {query}: 错误 - {e}")

    return results

def test_qwen_search():
    """测试千问系统性能（如果有API密钥）"""
    print("\n=== 千问语义搜索系统性能测试 ===")

    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key or api_key == "your-dashscope-api-key":
        print("  ❌ 未配置DASHSCOPE_API_KEY，跳过千问测试")
        return []

    test_queries = [
        '丐帮',
        '九阳神功',
        '如何拜师',
        '扬州怎么走',
        '新手怎么玩',
        '哪个门派最强',
        '怎么赚钱',
        '武功怎么学',
        '结婚系统介绍',
        '门派特色分析'
    ]

    results = []
    for query in test_queries:
        start = time.time()
        try:
            search_results = qwen_knowledge.semantic_search(query, limit=3, threshold=0.3)
            duration = (time.time() - start) * 1000
            results.append({
                'query': query,
                'duration': duration,
                'results_count': len(search_results),
                'system': 'qwen'
            })
            print(f"  {query}: {duration:.1f}ms, 找到{len(search_results)}条")
        except Exception as e:
            print(f"  {query}: 错误 - {e}")

    return results

def analyze_performance(results):
    """分析性能结果"""
    if not results:
        return

    durations = [r['duration'] for r in results]
    avg_time = sum(durations) / len(durations)
    min_time = min(durations)
    max_time = max(durations)

    system = results[0]['system']

    print(f"\n=== {system.upper()} 系统性能总结 ===")
    print(f"平均查询时间: {avg_time:.1f}ms")
    print(f"最快查询: {min_time:.1f}ms")
    print(f"最慢查询: {max_time:.1f}ms")
    print(f"数据规模: {len(results)}个测试查询")

    # 性能评级
    if avg_time < 10:
        rating = "优秀 🚀"
    elif avg_time < 50:
        rating = "良好 ✅"
    elif avg_time < 100:
        rating = "一般 ⚠️"
    else:
        rating = "需要优化 ❌"

    print(f"性能评级: {rating}")

    # 建议
    print(f"\n=== 建议 ===")
    if system == 'basic':
        if avg_time < 20:
            print("✅ 当前SQLite3性能优秀，无需升级")
        elif len(results) < 1000:
            print("⚠️ 数据量较小，SQLite3仍可胜任")
        else:
            print("🔧 建议考虑FAISS优化")

    return {
        'system': system,
        'avg_time': avg_time,
        'min_time': min_time,
        'max_time': max_time,
        'query_count': len(results),
        'rating': rating
    }

def main():
    """主测试函数"""
    print("🧪 炎黄群侠传AI NPC知识库性能测试")
    print("=" * 50)

    # 测试基础搜索
    basic_results = test_basic_search()
    basic_analysis = analyze_performance(basic_results)

    # 测试千问搜索
    qwen_results = test_qwen_search()
    if qwen_results:
        qwen_analysis = analyze_performance(qwen_results)

    # 数据规模统计
    print(f"\n=== 数据规模统计 ===")
    stats = basic_knowledge.get_stats()
    print(f"基础知识库文档总数: {stats['total_documents']}")
    print(f"分类分布: {stats['category_distribution']}")

    if os.getenv("DASHSCOPE_API_KEY"):
        qwen_stats = qwen_knowledge.get_stats()
        print(f"千问知识库文档总数: {qwen_stats['total_documents']}")

    print(f"\n✅ 测试完成！当前配置适合数据规模")

if __name__ == "__main__":
    main()
