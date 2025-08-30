#!/usr/bin/env python3
import json
import socket
import threading
import traceback
import os
import logging
from typing import Dict, Any
from src.memory_store import memory_store
from src.npc_manager import npc_manager
from src.history_manager import history_manager

# 设置日志级别
DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG if DEBUG else logging.WARNING)

# 创建控制台处理器
handler = logging.StreamHandler()
handler.setLevel(logging.DEBUG if DEBUG else logging.WARNING)
formatter = logging.Formatter('%(asctime)s - %(message)s', datefmt='%H:%M:%S')
handler.setFormatter(formatter)
logger.addHandler(handler)

class UDPServer:
    def __init__(self, host='127.0.0.1', port=9999):
        self.host = host
        self.port = port
        self.server_socket = None
        self.running = False

    def start(self):
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind((self.host, self.port))
            self.running = True

            logger.info("AI NPC服务器启动成功!")
            logger.info(f"监听地址: {self.host}:{self.port}")

            while self.running:
                try:
                    data, addr = self.server_socket.recvfrom(2048)
                    if data:
                        message = data.decode('utf-8').strip()
                        if DEBUG:
                            logger.debug(f"收到请求: {addr} -> {message}")

                        client_thread = threading.Thread(
                            target=self.handle_request,
                            args=(message, addr)
                        )
                        client_thread.daemon = True
                        client_thread.start()

                except socket.error as e:
                    if self.running:
                        logger.error(f"UDP错误: {e}")

        except Exception as e:
            logger.error(f"服务器启动失败: {e}")
            traceback.print_exc()

    def handle_request(self, message: str, addr):
        try:
            request = json.loads(message)
            if DEBUG:
                logger.debug(f"处理请求: {request}")
            response = self.process_request(request)
            if DEBUG:
                logger.debug(f"发送响应: {response}")

            response_json = json.dumps(response, ensure_ascii=False)
            self.server_socket.sendto(response_json.encode('utf-8'), addr)

        except Exception as e:
            import traceback
            error_response = {"error": str(e)}
            print(f"处理请求失败: {e}")
            traceback.print_exc()
            self.server_socket.sendto(json.dumps(error_response).encode('utf-8'), addr)

    def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        request_type = request.get("type", "chat")

        if request_type == "chat":
            return self.handle_chat(request)
        elif request_type == "memory":
            return self.handle_memory(request)
        elif request_type == "config":
            return self.handle_config(request)
        else:
            return {"error": f"未知请求类型: {request_type}"}

    def handle_chat(self, request: Dict[str, Any]) -> Dict[str, Any]:
        npc_id = request.get("npc_id")
        player_id = request.get("player_id")
        player_name = request.get("player_name", player_id)
        message = request.get("message", "")
        context = request.get("context", {})

        if not all([npc_id, player_id, message]):
            return {"error": "缺少必要参数"}

        # 获取NPC配置以获取中文名
        npc_config = npc_manager.get_npc_config(npc_id)
        npc_name = npc_config.get('name', npc_id)

        # 获取记忆容量配置，默认100条，0表示禁用历史记忆，其他值最小10条
        memory_capacity = npc_config.get('memory_capacity', 100)
        if memory_capacity == 0:
            history = []
        else:
            memory_capacity = max(10, memory_capacity)
            history = history_manager.get_conversation_history(npc_id, player_id, limit=memory_capacity)

        # 检查是否达到容量上限，自动触发摘要（仅当memory_capacity > 0时）
        # 注意：此消息内容必须与history_manager.py中的摘要查询保持一致
        if memory_capacity and len(history) >= memory_capacity:
            message = "【记忆回顾】我们聊过哪些内容呀？请详细总结我的提问和你的回答"

        # 获取NPC对该玩家的记忆（包含关系等级、亲密度等）
        player_memory = memory_store.get_player_memory(npc_id, player_id)

        # 生成回复并获取完整消息
        enriched_message, ai_response = npc_manager.generate_response(
            npc_id=npc_id,
            player_name=player_name,
            message=message,
            player_memory=player_memory,
            history=history,
            context=context
        )

        # 保存当前对话和回复（在生成回复之后）
        history_manager.save_conversation(npc_id=npc_id, npc_name=npc_name,
                                        player_id=player_id, player_name=player_name,
                                        role="user", content=enriched_message, message=message)
        history_manager.save_conversation(npc_id=npc_id, npc_name=npc_name,
                                        player_id=player_id, player_name=player_name,
                                        role="assistant", content=ai_response)

        # 更新记忆
        updated_memory = npc_manager.update_player_memory(
            npc_id=npc_id,
            player_id=player_id,
            player_name=player_name,
            message=message,
            response=ai_response,
            player_memory=player_memory
        )
        memory_store.update_player_memory(npc_id, player_id, player_name, updated_memory)

        return {
            "type": "chat",
            "response": ai_response,
            "npc_id": npc_id,
            "player_id": player_id
        }

    def handle_memory(self, request: Dict[str, Any]) -> Dict[str, Any]:
        npc_id = request.get("npc_id")
        player_id = request.get("player_id")

        memory = memory_store.get_player_memory(npc_id, player_id)
        conversations = history_manager.get_conversation_history(npc_id, player_id, limit=5)

        return {
            "type": "memory",
            "memory": memory,
            "recent_conversations": conversations,
            "npc_id": npc_id,
            "player_id": player_id
        }

    def handle_config(self, request: Dict[str, Any]) -> Dict[str, Any]:
        npc_id = request.get("npc_id")
        npc_config = npc_manager.get_npc_config(npc_id)
        return {"type": "config", "config": npc_config, "npc_id": npc_id}

    def stop(self):
        self.running = False
        if self.server_socket:
            self.server_socket.close()
        logger.info("AI服务器已停止")
