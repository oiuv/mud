#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NPC管理器 - 处理NPC角色和AI回复生成
"""

import json
import os
import random
import time
from typing import Dict, Any, List

class NPCManager:
    def __init__(self, config_file: str = None):
        if config_file is None:
            # 使用绝对路径
            current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.config_file = os.path.join(current_dir, "config", "npc_roles.json")
        else:
            self.config_file = config_file
        self.npc_configs = {}
        self.load_npc_configs()
    
    def load_npc_configs(self):
        """加载NPC配置"""
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                self.npc_configs = json.load(f)
            print(f"加载了 {len(self.npc_configs)} 个NPC配置")
        except Exception as e:
            print(f"加载NPC配置失败: {e}")
            self.npc_configs = {}
    
    def get_npc_config(self, npc_name: str) -> Dict[str, Any]:
        """获取NPC配置"""
        return self.npc_configs.get(npc_name, {})
    
    def generate_response(self, npc_name: str, player_name: str, message: str,
                         player_memory: Dict[str, Any], history: List[str],
                         context: Dict[str, Any]) -> str:
        """生成AI回复"""
        npc_config = self.get_npc_config(npc_name)
        if not npc_config:
            return f"抱歉，我不认识 {npc_name}"
        
        # 检查是否配置了API密钥
        api_key = os.getenv("MOONSHOT_API_KEY")
        if not api_key or api_key == "your-api-key":
            # 使用模拟回复
            return self.generate_mock_response(npc_config, player_memory, message)
        
        try:
            return self.generate_real_response(npc_config, player_memory, message, player_name, history, context)
        except Exception as e:
            # 如果API调用失败，使用模拟回复
            print(f"API调用失败，使用模拟回复: {e}")
            return self.generate_mock_response(npc_config, player_memory, message)
    
    def generate_real_response(self, npc_config: Dict[str, Any],
                             player_memory: Dict[str, Any], message: str,
                             player_name: str, history: List[str], context: Dict[str, Any]) -> str:
        """集成Moonshot AI生成真实回复"""
        
        # 构建系统提示
        system_prompt = f"""你是{npc_config['name']}，{npc_config['title']}，{npc_config['role']}。

游戏世界设定：
这是炎黄群侠传，一个大型中文武侠MUD游戏世界。这里有少林、武当、峨眉、华山、丐帮等各大门派，玩家可以拜师学艺、行走江湖、参与门派纷争。

人物设定：
- 身份：{npc_config['name']}，{npc_config['title']}，{npc_config['role']}
- 性格：{npc_config['personality']}
- 背景：{npc_config['background']}
- 说话风格：{npc_config['speech_style']}
- 擅长话题：{', '.join(npc_config['topics'])}
- 初次见面：{npc_config['greeting']}

当前情境：
- 时间：{context.get('time', '未知')}
- 地点：{context.get('location', '未知')}
- 天气：{context.get('weather', '未知')}

玩家信息：
- 姓名：{player_name}
- 关系：{player_memory.get('relationship', '陌生人')}
- 熟悉度：{player_memory.get('familiarity', 0)}/150
- 信任度：{player_memory.get('trust', 0)}/100
- 好感度：{player_memory.get('favor', 50)}/100

重要规则：
1. 保持{npc_config['name']}的身份、{npc_config['role']}地位和说话风格
2. 回复简洁，不超过100字
3. 使用古雅的中文表达
4. 记住这是炎黄群侠传游戏世界"""

        # 构建消息
        messages = [{"role": "system", "content": system_prompt}]
        
        # 添加历史对话 - 使用所有历史记录
        for line in history:
            line = line.strip()
            if "[玩家]" in line:
                # 格式：时间 [玩家] 内容
                parts = line.split(" [玩家] ", 1)
                if len(parts) == 2:
                    content = parts[1].strip()
                    messages.append({"role": "user", "content": content})
            elif "]" in line and "[" in line:
                # 格式：时间 [NPC名字] 内容
                parts = line.split("] ", 1)
                if len(parts) == 2:
                    content = parts[1].strip()
                    messages.append({"role": "assistant", "content": content})
        
        # 添加当前消息
        messages.append({"role": "user", "content": message})
        
        # 调用Moonshot AI
        try:
            from openai import OpenAI
            
            client = OpenAI(
                api_key=os.getenv("MOONSHOT_API_KEY", "your-api-key"),
                base_url="http://127.0.0.1:9988/v1",
            )
            
            completion = client.chat.completions.create(
                model="moonshot-v1-auto",
                messages=messages,
                temperature=0.7,
                max_tokens=200,
                timeout=10,  # 10秒超时
            )
            return completion.choices[0].message.content
            
        except ImportError:
            return "请先安装openai库: pip install openai"
        except Exception as e:
            return f"AI调用失败: {str(e)[:100]}... 让我想想怎么回答你..."
            
    def generate_mock_response(self, npc_config: Dict[str, Any], 
                             player_memory: Dict[str, Any], message: str) -> str:
        """生成模拟回复（用于测试或API失败时）"""
        greetings = [
            f"这位{player_memory.get('relationship', '朋友')}，{npc_config['greeting']}",
            f"原来是{player_memory.get('name', '朋友')}啊，今日天气正好，不如聊聊{npc_config['topics'][0]}？",
            f"{message}... 让我想想，{npc_config['name']}觉得此事颇为有趣。"
        ]
        return random.choice(greetings)
    
    def update_player_memory(self, npc_name: str, player_id: str,
                           player_name: str, message: str, response: str, 
                           player_memory: Dict[str, Any] = None) -> Dict[str, Any]:
        """根据对话更新玩家记忆，采用更精细的亲密度系统"""
        current = player_memory or {}
        familiarity = current.get('familiarity', 0)
        
        # 动态增长：前期快后期慢
        if familiarity < 20:  # 0-19
            increment = 1
        elif familiarity < 50:  # 20-49
            increment = 0.5
        elif familiarity < 100:  # 50-99
            increment = 0.2
        else:  # 100+
            increment = 0.1
            
        familiarity = min(150, familiarity + increment)
        
        # 更精细的关系等级
        if familiarity >= 120:
            relationship = "生死之交"  # 最高级
        elif familiarity >= 100:
            relationship = "莫逆之交"
        elif familiarity >= 80:
            relationship = "知己好友"
        elif familiarity >= 60:
            relationship = "挚交好友"
        elif familiarity >= 40:
            relationship = "至交"
        elif familiarity >= 25:
            relationship = "好友"
        elif familiarity >= 15:
            relationship = "朋友"
        elif familiarity >= 10:
            relationship = "相识"
        elif familiarity >= 5:
            relationship = "熟客"
        elif familiarity >= 2:
            relationship = "路人"
        else:
            relationship = "陌生人"
            
        # 额外属性：信任度、好感度
        trust = min(100, current.get('trust', 0) + (increment * 2))
        favor = min(100, current.get('favor', 50) + (increment * 1.5))
        
        return {
            "familiarity": round(familiarity, 1),
            "relationship": relationship,
            "trust": round(trust, 1),
            "favor": round(favor, 1),
            "total_interactions": current.get('total_interactions', 0) + 1,
            "last_chat": time.strftime("%Y-%m-%d %H:%M:%S")
        }

# 全局实例
npc_manager = NPCManager()