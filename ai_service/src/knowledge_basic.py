"""
基础向量知识库系统
使用简单向量化的基础版本
"""

import os
import json
import sqlite3
import hashlib
import re
from pathlib import Path
from typing import List, Dict, Optional

class BasicKnowledgeSystem:
    """基础知识库系统"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.help_dir = Path("../help")
        self.db_path = self.data_dir / "basic_knowledge.db"
        self._init_db()
    
    def _init_db(self):
        """初始化数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
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
        
        cursor.execute('''
            CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
                title, content, document_id UNINDEXED
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def process_files(self) -> int:
        """处理帮助文件"""
        if not self.help_dir.exists():
            return 0
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 清空数据
        cursor.execute("DELETE FROM documents")
        cursor.execute("DELETE FROM documents_fts")
        
        processed = 0
        for file in self.help_dir.glob("*"):
            if file.is_file():
                try:
                    content = self._read_file(file)
                    doc_id = hashlib.md5(content.encode()).hexdigest()[:16]
                    title = self._get_chinese_title(file.stem, content)
                    category = self._categorize(file.stem)
                    
                    cursor.execute('''
                        INSERT INTO documents (id, title, filename, content, category) VALUES (?, ?, ?, ?, ?)
                    ''', (doc_id, title, file.stem, content, category))
                    
                    cursor.execute('''
                        INSERT INTO documents_fts (title, content, document_id) VALUES (?, ?, ?)
                    ''', (title, content, doc_id))
                    
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
        
        # 清理内容，移除ANSI转义码和格式化字符
        content = re.sub(r'\033\[[0-9;]*m', '', content)  # ANSI颜色码
        content = re.sub(r'\$[A-Z]+\$', '', content)     # MUD格式化
        content = re.sub(r'-{10,}', '', content)         # 分隔线
        content = re.sub(r'\|', '', content)            # 表格线
        content = re.sub(r'\n{3,}', '\n\n', content)    # 多余空行
        return content.strip()
    
    def _get_chinese_title(self, filename: str, content: str) -> str:
        """获取中文标题"""
        filename = filename.lower()
        
        # 文件名到中文主题的映射
        title_map = {
            'shaolin': '少林派',
            'wudang': '武当派',
            'emei': '峨眉派',
            'huashan': '华山派',
            'gaibang': '丐帮',
            'taohua': '桃花岛',
            'xingxiu': '星宿派',
            'xiaoyao': '逍遥派',
            'gumu': '古墓派',
            'quanzhen': '全真派',
            'xuanming': '玄冥谷',
            'kunlun': '昆仑派',
            'mingjiao': '明教',
            'riyue': '日月神教',
            'lingjiu': '灵鹫宫',
            'song': '嵩山派',
            'dalunsi': '大轮寺',
            'tiezhang': '铁掌帮',
            'honghua': '红花会',
            'xuedao': '血刀门',
            'wudu': '五毒教',
            'meizhuang': '梅庄',
            'zhenyuan': '镇远镖局',
            'hengshan': '衡山派',
            'jueqing': '绝情谷',
            'ouyang': '欧阳世家',
            'hu': '关外胡家',
            'murong': '慕容世家',
            'duan': '段氏皇族',
            'miao': '中原苗家',
            'work': '工作指南',
            'help': '游戏帮助',
            'skills': '武功系统',
            'newbie': '新手指南',
            'commands': '游戏命令',
            'maps': '地图指南',
            'menpai': '门派系统',
            'job': '工作介绍'
        }
        
        # 优先使用映射，其次从内容中提取第一行
        if filename in title_map:
            return title_map[filename]
        
        # 从内容中提取中文标题（跳过ANSI艺术字符）
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        for line in lines[:5]:  # 检查前5行
            # 跳过纯符号或ANSI艺术的行
            if re.match(r'^[■□●○━═║║╔╗╚╝╠╣╦╩╬─│┌┐└┘├┤┬┴┼┏┓┗┛┣┫┳┻╋─│┌┐└┘├┤┬┴┼┏┓┗┛┣┫┳┻╋]+$', line):
                continue
            
            # 清理ANSI码和格式化字符
            title = re.sub(r'\033\[[0-9;]*m|\$[A-Z]+\$|\|', '', line)
            title = re.sub(r'-{10,}|【|】|■|□|●|○|━|═|║|║|╔|╗|╚|╝|╠|╣|╦|╩|╬|─|│|┌|┐|└|┘|├|┤|┬|┴|┼|┏|┓|┗|┛|┣|┫|┳|┻|╋', '', title).strip()
            
            # 确保标题有实际内容且不是纯符号
            if title and len(title) < 50 and re.search(r'[\u4e00-\u9fff]', title):
                return title
        
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
    
    def search(self, query: str, limit: int = 3) -> List[Dict]:
        """搜索文档 - 智能中英文搜索，返回最优结果"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 判断是否为英文关键词（ASCII字符为主）
        is_english = re.match(r'^[a-zA-Z0-9\s]+$', query.strip()) is not None
        
        if is_english:
            # 英文关键词：优先文件名匹配 + 内容匹配
            cursor.execute('''
                SELECT id, title, filename, content, category,
                       (
                           -- 文件名完全匹配 +120分
                           CASE WHEN LOWER(filename) = LOWER(?) THEN 120 ELSE 0 END +
                           -- 文件名包含关键词 +80分
                           CASE WHEN LOWER(filename) LIKE LOWER(?) THEN 80 ELSE 0 END +
                           -- 文件名开头匹配 +60分
                           CASE WHEN LOWER(filename) LIKE LOWER(?) THEN 60 ELSE 0 END +
                           -- 标题包含关键词 +40分
                           CASE WHEN title LIKE ? THEN 40 ELSE 0 END +
                           -- 内容关键词出现次数 * 10分
                           (LENGTH(content) - LENGTH(REPLACE(LOWER(content), LOWER(?), ''))) / LENGTH(?) * 10 +
                           -- 内容开头匹配 +20分
                           CASE WHEN content LIKE ? THEN 20 ELSE 0 END +
                           -- 内容包含关键词 +10分
                           CASE WHEN content LIKE ? THEN 10 ELSE 0 END +
                           -- 内容长度惩罚（越短越好）
                           100.0 / (LENGTH(content) / 100.0 + 1)
                       ) as relevance_score
                FROM documents
                WHERE filename LIKE ? OR title LIKE ? OR content LIKE ?
                ORDER BY relevance_score DESC, LENGTH(content) ASC
                LIMIT ?
            ''', (
                query, f'%{query}%', f'{query}%', f'%{query}%', query, query, f'{query}%', f'%{query}%',
                f'%{query}%', f'%{query}%', f'%{query}%', limit
            ))
        else:
            # 中文关键词：优先标题匹配 + 内容匹配
            cursor.execute('''
                SELECT id, title, filename, content, category,
                       (
                           -- 标题完全匹配 +100分
                           CASE WHEN title = ? THEN 100 ELSE 0 END +
                           -- 标题包含关键词 +50分
                           CASE WHEN title LIKE ? THEN 50 ELSE 0 END +
                           -- 标题开头匹配 +30分
                           CASE WHEN title LIKE ? THEN 30 ELSE 0 END +
                           -- 内容关键词出现次数 * 10分
                           (LENGTH(content) - LENGTH(REPLACE(LOWER(content), LOWER(?), ''))) / LENGTH(?) * 10 +
                           -- 内容开头匹配 +20分
                           CASE WHEN content LIKE ? THEN 20 ELSE 0 END +
                           -- 内容包含关键词 +10分
                           CASE WHEN content LIKE ? THEN 10 ELSE 0 END +
                           -- 内容长度惩罚（越短越好）
                           100.0 / (LENGTH(content) / 100.0 + 1)
                       ) as relevance_score
                FROM documents
                WHERE title LIKE ? OR content LIKE ?
                ORDER BY relevance_score DESC, LENGTH(content) ASC
                LIMIT ?
            ''', (
                query, f'%{query}%', f'{query}%', query, query, f'{query}%', f'%{query}%',
                f'%{query}%', f'%{query}%', limit
            ))
        
        results = []
        for row in cursor.fetchall():
            results.append({
                "id": row[0],
                "title": row[1],
                "filename": row[2],
                "content": row[3],
                "category": row[4],
                "score": float(row[5])
            })
        
        conn.close()
        return results
    
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
            "category_distribution": categories
        }

# 全局实例
basic_knowledge = BasicKnowledgeSystem()