#!/usr/bin/env python3
"""
AI服务测试客户端
"""

import json
import socket
import sys
import os

def test_chat(npc_name="li bai", message="你好"):
    """测试聊天功能"""
    try:
        client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

        request = {
            "type": "chat",
            "npc_id": npc_name,
            "player_id": "test_player_123",
            "player_name": "测试玩家",
            "message": message,
            "context": {
                "time": "午时",
                "location": "长安城",
                "weather": "晴朗"
            }
        }

        client.sendto(json.dumps(request, ensure_ascii=False).encode('utf-8'),
                     ('127.0.0.1', 9999))

        data, addr = client.recvfrom(2048)
        response = json.loads(data.decode('utf-8'))

        response_text = response.get('response', '无回复')
        print("=== AI NPC回复 ===")
        print(f"NPC: {response_text}")
        print("================")

        return response

    except Exception as e:
        print(f"测试失败: {e}")
        return None

def test_memory(npc_name="li bai"):
    """测试记忆功能"""
    try:
        client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

        request = {
            "type": "memory",
            "npc_id": npc_name,
            "player_id": "test_player_123"
        }

        client.sendto(json.dumps(request).encode('utf-8'), ('127.0.0.1', 9999))
        data, addr = client.recvfrom(2048)
        response = json.loads(data.decode('utf-8'))

        print("=== 记忆信息 ===")
        print(f"记忆: {response.get('memory', {})}")
        print(f"最近对话: {len(response.get('recent_conversations', []))} 条")
        print("================")

        return response

    except Exception as e:
        print(f"测试失败: {e}")
        return None

def test_config(npc_name="li bai"):
    """测试配置功能"""
    try:
        client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

        request = {
            "type": "config",
            "npc_id": npc_name
        }

        client.sendto(json.dumps(request).encode('utf-8'), ('127.0.0.1', 9999))
        data, addr = client.recvfrom(2048)
        response = json.loads(data.decode('utf-8'))

        print("=== NPC配置 ===")
        print(f"名称: {response.get('config', {}).get('name', '未知')}")
        print(f"角色: {response.get('config', {}).get('role', '未知')}")
        print("================")

        return response

    except Exception as e:
        print(f"测试失败: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "chat":
            npc = sys.argv[2] if len(sys.argv) > 2 else "li bai"
            msg = sys.argv[3] if len(sys.argv) > 3 else "你好"
            test_chat(npc, msg)
        elif sys.argv[1] == "memory":
            npc = sys.argv[2] if len(sys.argv) > 2 else "li bai"
            test_memory(npc)
        elif sys.argv[1] == "config":
            npc = sys.argv[2] if len(sys.argv) > 2 else "li bai"
            test_config(npc)
    else:
        print("使用方式:")
        print("python test_client.py chat [npc_name] [message]")
        print("python test_client.py memory [npc_name]")
        print("python test_client.py config [npc_name]")

        # 运行默认测试
        test_config()
        test_chat()
        test_memory()
