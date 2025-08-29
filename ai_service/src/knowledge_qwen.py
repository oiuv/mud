"""
千问语义知识库系统
使用text-embedding-v4实现高级语义搜索
"""

import os
import json
import sqlite3
import hashlib
import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import numpy as np
from openai import OpenAI

class QwenKnowledgeSystem:
    """千问语义知识库系统"""

    def __init__(self, data_dir: str = "data", model_name: str = "text-embedding-v4",
                 dimensions: int = 1024):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.help_dir = Path("../help")
        self.db_path = self.data_dir / "qwen_knowledge.db"
        self.model_name = model_name
        self.dimensions = dimensions

        # 千问客户端
        self.client = OpenAI(
            api_key=os.getenv("DASHSCOPE_API_KEY"),
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
        )

        self._init_db()

    def _init_db(self):
        """初始化向量数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # 文档表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT,
                filename TEXT,
                content TEXT,
                category TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # 向量索引表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS vectors (
                document_id TEXT PRIMARY KEY,
                vector BLOB,
                FOREIGN KEY (document_id) REFERENCES documents(id)
            )
        ''')

        conn.commit()
        conn.close()

    def get_embedding(self, text: str) -> np.ndarray:
        """获取文本的向量表示"""
        try:
            response = self.client.embeddings.create(
                model=self.model_name,
                input=text,
                dimensions=self.dimensions
            )
            return np.array(response.data[0].embedding, dtype=np.float32)
        except Exception as e:
            print(f"向量获取失败: {e}")
            return np.zeros(self.dimensions, dtype=np.float32)

    def process_files(self) -> int:
        """处理帮助文件并生成向量"""
        if not self.help_dir.exists():
            return 0

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # 清空数据
        cursor.execute("DELETE FROM documents")
        cursor.execute("DELETE FROM vectors")

        processed = 0
        documents = []

        for file in self.help_dir.glob("*"):
            if file.is_file():
                try:
                    content = self._read_file(file)
                    doc_id = hashlib.md5(f"{file.stem}_{len(content)}_{file.stat().st_mtime}".encode()).hexdigest()[:16]
                    title = self._get_chinese_title(file.stem, content)
                    category = self._categorize(file.stem)

                    # 生成向量
                    vector = self.get_embedding(content[:2000])  # 截断避免超长

                    cursor.execute('''
                        INSERT INTO documents (id, title, filename, content, category)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (doc_id, title, file.stem, content, category))

                    cursor.execute('''
                        INSERT INTO vectors (document_id, vector) VALUES (?, ?)
                    ''', (doc_id, vector.tobytes()))

                    processed += 1

                except Exception as e:
                    print(f"处理失败 {file}: {e}")

        conn.commit()
        conn.close()
        return processed

    def _read_file(self, file: Path) -> str:
        """读取文件完整内容"""
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            with open(file, 'r', encoding='gbk') as f:
                content = f.read()

        # 清理内容
        content = re.sub(r'\033\[[0-9;]*m', '', content)
        content = re.sub(r'\$[A-Z]+\$', '', content)
        content = re.sub(r'-{10,}', '', content)
        content = re.sub(r'\|', '', content)
        content = re.sub(r'\n{3,}', '\n\n', content)
        return content.strip()

    def _get_chinese_title(self, filename: str, content: str) -> str:
        """获取中文标题"""
        filename = filename.lower()
        title_map = {
            'shaolin': '少林派', 'wudang': '武当派', 'emei': '峨眉派',
            'huashan': '华山派', 'gaibang': '丐帮', 'taohua': '桃花岛',
            'xingxiu': '星宿派', 'xiaoyao': '逍遥派', 'gumu': '古墓派',
            'quanzhen': '全真派', 'xuanming': '玄冥谷', 'kunlun': '昆仑派',
            'mingjiao': '明教', 'riyue': '日月神教', 'lingjiu': '灵鹫宫',
            'song': '嵩山派', 'dalunsi': '大轮寺', 'tiezhang': '铁掌帮',
            'honghua': '红花会', 'xuedao': '血刀门', 'wudu': '五毒教',
            'meizhuang': '梅庄', 'zhenyuan': '镇远镖局', 'hengshan': '衡山派',
            'jueqing': '绝情谷', 'ouyang': '欧阳世家', 'hu': '关外胡家',
            'murong': '慕容世家', 'duan': '段氏皇族', 'miao': '中原苗家',
            'work': '工作指南', 'help': '游戏帮助', 'skills': '武功系统',
            'newbie': '新手指南', 'commands': '游戏命令', 'maps': '地图指南',
            'menpai': '门派系统', 'job': '工作介绍'
        }

        if filename in title_map:
            return title_map[filename]
        return filename.title()

    def _categorize(self, filename: str) -> str:
        """自动分类"""
        filename = filename.lower()
        if 'map' in filename or '地图' in filename:
            return '地图'
        elif 'skill' in filename or '武功' in filename:
            return '技能'
        elif 'cmd' in filename:
            return '命令'
        elif '门派' in filename:
            return '门派'
        elif '新手' in filename or 'newbie' in filename:
            return '新手'
        else:
            return '其他'

    def semantic_search(self, query: str, limit: int = 5, threshold: float = 0.4) -> List[Dict]:
        """语义搜索 - 使用向量相似度"""
        query_vec = self.get_embedding(query)

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # 获取所有文档和向量
        cursor.execute('''
            SELECT documents.id, documents.title, documents.filename, documents.content, documents.category, vectors.vector
            FROM documents
            JOIN vectors ON documents.id = vectors.document_id
        ''')

        results = []
        for row in cursor.fetchall():
            doc_vec = np.frombuffer(row[5], dtype=np.float32)

            # 计算余弦相似度
            norm_query = np.linalg.norm(query_vec)
            norm_doc = np.linalg.norm(doc_vec)

            if norm_query > 0 and norm_doc > 0:
                similarity = np.dot(query_vec, doc_vec) / (norm_query * norm_doc)

                # 额外文件名匹配权重
                filename_bonus = 0
                query_lower = query.lower()
                filename_lower = row[2].lower()

                if query_lower in filename_lower:
                    filename_bonus = 0.3
                elif filename_lower in query_lower:
                    filename_bonus = 0.2

                final_score = similarity + filename_bonus

                if final_score >= threshold:
                    results.append({
                        "id": row[0],
                        "title": row[1],
                        "filename": row[2],
                        "content": row[3],
                        "category": row[4],
                        "score": float(final_score)
                    })

        conn.close()
        return sorted(results, key=lambda x: x["score"], reverse=True)[:limit]

    def hybrid_search(self, query: str, limit: int = 5) -> List[Dict]:
        """混合搜索：主要依赖向量语义，关键词作为补充"""
        # 优先使用语义搜索
        semantic_results = self.semantic_search(query, limit * 2, threshold=0.15)

        # 如果语义结果足够好，直接返回
        if len(semantic_results) >= limit:
            return semantic_results[:limit]

        # 补充关键词搜索作为后备
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT documents.id, documents.title, documents.filename, documents.content, documents.category,
                   (
                       CASE WHEN documents.filename LIKE ? THEN 150 ELSE 0 END +
                       CASE WHEN documents.content LIKE ? THEN 100 ELSE 0 END +
                       50.0 / (LENGTH(documents.content) / 100.0 + 1)
                   ) as relevance_score
            FROM documents
            WHERE documents.filename LIKE ? OR documents.content LIKE ?
            ORDER BY relevance_score DESC
            LIMIT ?
        ''', (f'%{query}%', f'%{query}%', f'%{query}%', f'%{query}%', limit))

        keyword_results = []
        for row in cursor.fetchall():
            keyword_results.append({
                "id": row[0],
                "title": row[1],
                "filename": row[2],
                "content": row[3],
                "category": row[4],
                "score": float(row[5]) * 0.005
            })

        conn.close()

        # 合并结果，语义优先
        seen = {r["id"] for r in semantic_results}
        combined = semantic_results + [r for r in keyword_results if r["id"] not in seen]
        return sorted(combined, key=lambda x: x["score"], reverse=True)[:limit]

    def get_stats(self) -> Dict:
        """获取统计"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('SELECT COUNT(*) FROM documents')
        total = cursor.fetchone()[0]

        cursor.execute('''
            SELECT category, COUNT(*) FROM documents GROUP BY category
        ''')
        categories = {row[0]: row[1] for row in cursor.fetchall()}

        conn.close()

        return {
            "total_documents": total,
            "total_categories": len(categories),
            "category_distribution": categories,
            "model": self.model_name,
            "dimensions": self.dimensions
        }

    def update_vectors(self):
        """更新所有文档向量"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('SELECT id, content FROM documents')
        documents = cursor.fetchall()

        for doc_id, content in documents:
            vector = self.get_embedding(content[:2000])
            cursor.execute('''
                UPDATE vectors SET vector = ? WHERE document_id = ?
            ''', (vector.tobytes(), doc_id))

        conn.commit()
        conn.close()

# 全局实例
qwen_knowledge = QwenKnowledgeSystem()
