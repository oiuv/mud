#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI记忆存储系统 - 管理NPC对玩家的记忆和聊天记录
"""

import json
import os
import time
from pathlib import Path
from typing import Dict, Any, List

class MemoryStore:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.conversations_dir = self.data_dir / "conversations"
        self.memories_file = self.data_dir / "memories.json"
        
        # 创建目录
        self.conversations_dir.mkdir(parents=True, exist_ok=True)
        
        # 初始化记忆文件
        if not self.memories_file.exists():
            with open(self.memories_file, 'w', encoding='utf-8') as f:
                f.write('{}')
    
    
    def get_player_memory(self, npc_name: str, player_id: str) -> Dict[str, Any]:
        """获取NPC对玩家的记忆"""
        try:
            with open(self.memories_file, "r", encoding="utf-8") as f:
                memories = json.load(f)
            return memories.get(npc_name, {}).get(player_id, {})
        except Exception as e:
            print(f"获取记忆失败: {e}")
            return {}
    
    def update_player_memory(self, npc_name: str, player_id: str, player_name: str, 
                           updates: Dict[str, Any]):
        """更新NPC对玩家的记忆"""
        try:
            with open(self.memories_file, "r", encoding="utf-8") as f:
                memories = json.load(f)
            
            if npc_name not in memories:
                memories[npc_name] = {}
            
            if player_id not in memories[npc_name]:
                memories[npc_name][player_id] = {
                    "name": player_name,
                    "first_met": time.strftime("%Y-%m-%d"),
                    "familiarity": 0,
                    "topics": [],
                    "personality": [],
                    "relationship": "陌生人",
                    "last_chat": time.strftime("%Y-%m-%d %H:%M:%S")
                }
            
            # 更新记忆
            current = memories[npc_name][player_id]
            current.update(updates)
            current["last_chat"] = time.strftime("%Y-%m-%d %H:%M:%S")
            
            # 保存回文件
            with open(self.memories_file, "w", encoding="utf-8") as f:
                json.dump(memories, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            print(f"更新记忆失败: {e}")
    
    def get_npc_players(self, npc_name: str) -> Dict[str, Dict[str, Any]]:
        """获取NPC认识的所有玩家"""
        try:
            with open(self.memories_file, "r", encoding="utf-8") as f:
                memories = json.load(f)
            return memories.get(npc_name, {})
        except Exception as e:
            print(f"获取玩家列表失败: {e}")
            return {}

# 全局实例
memory_store = MemoryStore()