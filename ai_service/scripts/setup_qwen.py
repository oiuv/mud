#!/usr/bin/env python3
"""
千问向量知识库构建脚本
"""

import sys
import os
from pathlib import Path

# 添加路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from knowledge_qwen import qwen_knowledge

def main():
    """主函数"""
    print("🚀 千问语义知识库构建...")
    print("=" * 50)
    
    # 检查API密钥
    api_key = os.getenv("DASHSCOPE_API_KEY")
    if not api_key:
        print("❌ 请先设置DASHSCOPE_API_KEY环境变量")
        return 1
    
    try:
        # 构建向量知识库
        processed = qwen_knowledge.process_files()
        
        # 显示结果
        stats = qwen_knowledge.get_stats()
        print(f"\n✅ 构建完成:")
        print(f"   📄 文档数: {stats['total_documents']}")
        print(f"   🏷️  类别数: {stats['total_categories']}")
        print(f"   🧠 模型: {stats['model']} ({stats['dimensions']}维)")
        
        # 测试语义搜索
        if stats['total_documents'] > 0:
            print(f"\n🧪 语义搜索测试:")
            results = qwen_knowledge.semantic_search("如何学习武功", limit=3)
            if results:
                print(f"   '如何学习武功' → {results[0]['title']} (相似度: {results[0]['score']:.3f})")
            
            # 测试混合搜索
            hybrid_results = qwen_knowledge.hybrid_search("华山派入门", limit=2)
            print(f"\n🎯 混合搜索测试:")
            for i, result in enumerate(hybrid_results):
                print(f"   {i+1}. {result['title']} (得分: {result['score']:.3f})")
        
        print("\n🎯 千问语义系统已就绪！")
        
    except Exception as e:
        print(f"❌ 构建失败: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)