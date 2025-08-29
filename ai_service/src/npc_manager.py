#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NPC管理器 - 处理NPC角色和AI回复生成
"""

import json
import os
import random
import time
import logging
from typing import Dict, Any, List
import sys

# 设置日志
logger = logging.getLogger(__name__)

# 添加基础知识库支持
current_dir = os.path.dirname(os.path.abspath(__file__))
knowledge_path = os.path.join(os.path.dirname(current_dir), "src", "knowledge_basic.py")
sys.path.insert(0, os.path.dirname(current_dir))
from knowledge_basic import basic_knowledge

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

    def generate_response(self, npc_id: str, player_name: str, message: str,
                         player_memory: Dict[str, Any], history: List[Dict[str, str]],
                         context: Dict[str, Any]) -> tuple[str, str]:
        """生成AI回复"""
        npc_config = self.get_npc_config(npc_id)
        if not npc_config:
            return f"抱歉，我不认识 {npc_id}"

        # 检查是否配置了API密钥
        api_key = os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.moonshot.cn/v1")
        model = os.getenv("OPENAI_MODEL", "moonshot-v1-auto")

        if not api_key or api_key == "your-api-key":
            # 使用模拟回复
            return self.generate_mock_response(npc_config, player_memory, message)

        try:
            return self.generate_real_response(npc_config, npc_id, player_memory, message, player_name, history, context, api_key, base_url, model)
        except Exception as e:
            # 如果API调用失败，使用模拟回复
            print(f"API调用失败，使用模拟回复: {e}")
            return self.generate_mock_response(npc_config, player_memory, message)

    def generate_real_response(self, npc_config: Dict[str, Any], npc_id: str,
                             player_memory: Dict[str, Any], message: str,
                             player_name: str, history: List[Dict[str, str]], context: Dict[str, Any],
                             api_key: str, base_url: str, model: str) -> tuple[str, str]:
        """集成Moonshot AI生成真实回复"""

        # 构建知识库分类
        person_knowledge = "\n".join("• " + item for item in npc_config.get('knowledge_base', []))
        game_knowledge = []

        # 尝试使用千问语义搜索
        try:
            from knowledge_qwen import qwen_knowledge
            threshold = npc_config.get('knowledge_threshold', 0.4)
            search_results = qwen_knowledge.semantic_search(message, limit=3, threshold=threshold)
            if search_results:
                for result in search_results:
                    game_knowledge.append(f"{result['title']}\n{result['content']}")
                logger.info(f"📚 千问语义查询: npc={npc_config['name']}, query='{message}', threshold={threshold}, results={len(search_results)}")
                for result in search_results:
                    logger.debug(f"   📖 结果: {result['title']} (相似度={result['score']:.3f})")
            else:
                logger.info(f"📚 千问语义查询无结果: npc={npc_config['name']}, query='{message}', threshold={threshold}")
        except ImportError:
            # 千问系统不可用，使用基础搜索
            from knowledge_basic import basic_knowledge
            search_results = basic_knowledge.search(message, limit=3)
            if search_results:
                for result in search_results:
                    game_knowledge.append(f"{result['title']}\n{result['content']}")
                logger.info(f"📚 基础查询(千问不可用): npc={npc_config['name']}, query='{message}', results={len(search_results)}")
            else:
                logger.info(f"📚 基础查询无结果: npc={npc_config['name']}, query='{message}'")
        except Exception as e:
            logger.error(f"❌ 知识库查询失败: {e}")
            # 异常时也使用基础搜索作为最终保障
            from knowledge_basic import basic_knowledge
            search_results = basic_knowledge.search(message, limit=3)
            if search_results:
                for result in search_results:
                    game_knowledge.append(f"{result['title']}\n{result['content']}")
                logger.info(f"📚 基础查询(异常回退): npc={npc_config['name']}, query='{message}', results={len(search_results)}")
            else:
                logger.info(f"📚 基础查询无结果(异常回退): npc={npc_config['name']}, query='{message}'")
        game_knowledge = "\n".join("• " + item for item in game_knowledge)

        # 构建系统提示（只有静态内容，用于缓存命中优化）
        system_prompt = f"""# 角色设定

## 基本信息
**姓名**: {npc_config['name']}
**身份**: {npc_config['title']}
**角色**: {npc_config['role']}

## 人物性格
- **性格特征**: {npc_config['personality']}
- **背景故事**: {npc_config['background']}
- **说话风格**: {npc_config['speech_style']}
- **初次问候**: {npc_config['greeting']}

### 📚 人物专属知识
{person_knowledge}

## 互动偏好
| 类别 | 内容 |
|------|------|
| **擅长话题** | {', '.join(npc_config['topics'])} |
| **喜好礼物** | {', '.join(npc_config.get('relationship_tips', {}).get('gifts', []))} |
| **喜欢话题** | {', '.join(npc_config.get('relationship_tips', {}).get('topics', []))} |
| **忌讳话题** | {', '.join(npc_config.get('relationship_tips', {}).get('taboos', []))} |

## 游戏世界背景

### 🏯 **炎黄群侠传** - 大型中文武侠MUD游戏世界

**核心特色**: 这是一个完整的中文武侠世界，包含以下系统：

#### 📖 游戏系统
- **转世重生系统** - 玩家可转世获得新天赋
- **婚姻系统** - 玩家可结婚建立家庭
- **结义联盟** - 玩家可建立帮派联盟
- **住房系统** - 可购买装修个人房屋
- **商业系统** - 完善的经济和交易体系
- **生产系统** - 采矿、锻造、炼药等
- **天赋系统** - 随机天赋影响成长

#### 🏛️ 门派体系
**正派**: 少林、武当、峨眉、华山、丐帮、全真、昆仑、嵩山、衡山
**邪派**: 星宿、逍遥、日月神教、五毒教、血刀门
**中立**: 桃花岛、古墓派、玄冥谷、大轮寺、铁掌帮、红花会、绝情谷
**世家**: 欧阳世家、慕容世家、关外胡家、段氏皇族、中原苗家

## 🎯 回复规则

### 必须遵守
1. **身份保持**: 始终以{npc_config['name']}的{npc_config['role']}角色身份回应
2. **回复策略**:
   - **有参考知识**: 当用户消息【游戏参考知识】部分有内容时，基于这些知识详细完整回答，字数限制800字以内，**仅用对话内容**
   - **无参考知识**: 当用户消息【游戏参考知识】部分为空时，简洁回复不超过200字，保持{npc_config['speech_style']}风格，**仅用对话内容**
   - **知识优先**: 优先使用【游戏参考知识】和【人物专属知识】部分的内容，避免编造虚假内容
3. **语言风格**: 使用古雅中文，{npc_config['speech_style']}，避免现代词汇
4. **角色认知**: 牢记你是炎黄群侠传武侠游戏世界的角色
5. **输出格式**: **直接输出对话内容，不包含"{npc_config['name']}说道"或动作描述**

### 颜色规范（ANSI）
| 类型 | 颜色 | 示例 |
|------|------|------|
| **任务** | 红色 | `\033[1;31m送信任务\033[0m` |
| **门派** | 绿色 | `\033[1;32m少林\033[0m` |
| **物品** | 黄色 | `\033[1;33m银两\033[0m` |
| **属性** | 蓝色 | `\033[1;34m内力\033[0m` |
| **武功** | 紫色 | `\033[1;35m降龙十八掌\033[0m` |
| **地点** | 紫色 | `\033[1;35m扬州\033[0m` |
| **指令** | 青色 | `\033[1;36mhelp\033[0m` |
| **提示** | 白色 | `\033[1;37m重要提示\033[0m` |

**表达要求**:
- **角色化**: 始终用{npc_config['name']}的身份和语气讲述
- **流畅叙述**: 用流畅的口语化叙述表达，避免生硬列表
- **准确表述**: 准确使用参考知识中具体门派、人物、地点、技能名称等内容
- **颜色运用**: 在关键门派、武功、指令等处可巧妙使用ANSI颜色增强可读性
"""
        # 构建包含动态资料的用户消息
        enriched_message = f"""## 当前情境
时间: {context.get('time', '未知')} | 地点: {context.get('location', '未知')} | 天气: {context.get('weather', '未知')}

## 玩家关系档案
姓名: {player_name} | 关系: {player_memory.get('relationship', '陌生人')} | 熟悉度: {player_memory.get('familiarity', 0)}/150 | 信任度: {player_memory.get('trust', 0)}/100 | 好感度: {player_memory.get('favor', 50)}/100

## 游戏参考知识
{game_knowledge}

---------

## 玩家输入
{message}"""

        # 构建消息
        messages = [{"role": "system", "content": system_prompt}]

        # 添加历史对话 - 直接使用结构化历史
        messages.extend(history)

        # 添加包含动态资料的用户消息
        messages.append({"role": "user", "content": enriched_message})

        # 调用Moonshot AI
        try:
            from openai import OpenAI

            client = OpenAI(
                api_key=api_key,
                base_url=base_url,
            )

            completion = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024,  # 1024 tokens ≈ 750 Chinese characters - optimal balance
                timeout=10,  # 10秒超时
            )
            return enriched_message, completion.choices[0].message.content

        except ImportError:
            return enriched_message, "请先安装openai库: pip install openai"
        except Exception as e:
            return enriched_message, f"AI调用失败: {str(e)[:100]}... 让我想想怎么回答你..."

    def generate_mock_response(self, npc_config: Dict[str, Any],
                             player_memory: Dict[str, Any], message: str) -> tuple[str, str]:
        """生成模拟回复（用于测试或API失败时）"""
        greetings = [
            f"这位{player_memory.get('relationship', '朋友')}，{npc_config['greeting']}",
            f"原来是{player_memory.get('name', '朋友')}啊，今日天气正好，不如聊聊{npc_config['topics'][0]}？",
            f"{message}... 让我想想，{npc_config['name']}觉得此事颇为有趣。"
        ]
        # 构建模拟的enriched_message
        enriched_message = f"## 玩家输入\n{message}"
        return enriched_message, random.choice(greetings)

    def update_player_memory(self, npc_id: str, player_id: str,
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
