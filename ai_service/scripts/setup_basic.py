#!/usr/bin/env python3
"""
基础版本初始化脚本
"""

import sys
import os
from pathlib import Path

# 添加路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from knowledge_basic import basic_knowledge

def main():
    """主函数"""
    print("🚀 炎黄群侠传基础知识库初始化...")
    print("=" * 50)

    try:
        # 处理帮助文件
        processed = basic_knowledge.process_files()

        # 显示结果
        stats = basic_knowledge.get_stats()
        print(f"\n✅ 初始化完成:")
        print(f"   📄 文档数: {stats['total_documents']}")
        print(f"   🏷️  类别数: {stats['total_categories']}")

        # 测试
        if stats['total_documents'] > 0:
            print(f"\n🧪 测试查询:")
            results = basic_knowledge.search("拜师", limit=1)
            if results:
                print(f"   '拜师' → {results[0]['title']}")

        print("\n🎯 基础系统已就绪！")

    except Exception as e:
        print(f"❌ 失败: {e}")
        return 1

    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
