#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
历史对话管理器 - SQLite3版本
极简设计，与OpenAI API字段完全一致
"""

import sqlite3
import os
import time
from pathlib import Path
from typing import Dict, Any, List

class HistoryManager:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.db_path = self.data_dir / "conversations.db"
        self._init_db()
    
    def _init_db(self):
        """初始化SQLite数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                npc_id TEXT NOT NULL,
                npc_name TEXT NOT NULL,
                player_id TEXT NOT NULL,
                player_name TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
                content TEXT NOT NULL, -- 真实消息内容
                message TEXT,          -- 玩家原始输入（仅role='user'时有）
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_npc_player 
            ON conversations(npc_id, player_id)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_timestamp 
            ON conversations(timestamp DESC)
        ''')
        
        conn.commit()
        conn.close()
    
    def save_conversation(self, npc_id: str, npc_name: str, player_id: str, 
                         player_name: str, role: str, content: str, message: str = None):
        """保存单条对话记录"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO conversations (npc_id, npc_name, player_id, player_name, role, content, message)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (npc_id, npc_name, player_id, player_name, role, content, message))
        
        conn.commit()
        conn.close()
    
    def get_conversation_history(self, npc_id: str, player_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """获取对话历史，直接用于OpenAI API"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT role, content FROM conversations 
            WHERE npc_id = ? AND player_id = ?
            ORDER BY timestamp ASC
            LIMIT ?
        ''', (npc_id, player_id, limit))
        
        results = [{"role": row[0], "content": row[1]} for row in cursor.fetchall()]
        conn.close()
        return results
    
    def get_all_conversations(self, npc_id: str) -> List[Dict[str, Any]]:
        """获取NPC的所有对话记录"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT player_id, player_name, role, content, timestamp
            FROM conversations
            WHERE npc_id = ?
            ORDER BY timestamp DESC
        ''', (npc_id,))
        
        results = [
            {
                "player_id": row[0],
                "player_name": row[1],
                "role": row[2],
                "content": row[3],
                "timestamp": row[4]
            }
            for row in cursor.fetchall()
        ]
        
        conn.close()
        return results
    
    def clear_history(self, npc_id: str, player_id: str):
        """清空特定对话历史"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            DELETE FROM conversations 
            WHERE npc_id = ? AND player_id = ?
        ''', (npc_id, player_id))
        
        conn.commit()
        conn.close()

# 全局实例
history_manager = HistoryManager()