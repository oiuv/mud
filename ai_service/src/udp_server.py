#!/usr/bin/env python3
import json
import socket
import threading
import traceback
from typing import Dict, Any
from src.memory_store import memory_store
from src.npc_manager import npc_manager

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

            print("AI NPC服务器启动成功!")
            print(f"监听地址: {self.host}:{self.port}")

            while self.running:
                try:
                    data, addr = self.server_socket.recvfrom(2048)
                    if data:
                        message = data.decode('utf-8').strip()
                        print(f"收到请求: {addr} -> {message}")

                        client_thread = threading.Thread(
                            target=self.handle_request,
                            args=(message, addr)
                        )
                        client_thread.daemon = True
                        client_thread.start()

                except socket.error as e:
                    if self.running:
                        print(f"UDP错误: {e}")

        except Exception as e:
            print(f"服务器启动失败: {e}")
            traceback.print_exc()

    def handle_request(self, message: str, addr):
        try:
            request = json.loads(message)
            print(f"处理请求: {request}")
            response = self.process_request(request)
            print(f"发送响应: {response}")

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
        npc_name = request.get("npc_id")
        player_id = request.get("player_id")
        player_name = request.get("player_name", player_id)
        message = request.get("message", "")
        context = request.get("context", {})

        if not all([npc_name, player_id, message]):
            return {"error": "缺少必要参数"}

        # 获取历史记录（不包含当前消息）
        history = memory_store.get_conversations(npc_name, player_id, limit=100)
        player_memory = memory_store.get_player_memory(npc_name, player_id)

        # 生成回复
        ai_response = npc_manager.generate_response(
            npc_name=npc_name,
            player_name=player_name,
            message=message,
            player_memory=player_memory,
            history=history,
            context=context
        )

        # 保存当前对话和回复（在生成回复之后）
        memory_store.save_conversation(npc_name, player_id, "玩家", message)
        memory_store.save_conversation(npc_name, player_id, npc_name, ai_response)

        # 更新记忆
        updated_memory = npc_manager.update_player_memory(
            npc_name=npc_name,
            player_id=player_id,
            player_name=player_name,
            message=message,
            response=ai_response,
            player_memory=player_memory
        )
        memory_store.update_player_memory(npc_name, player_id, player_name, updated_memory)

        return {
            "type": "chat",
            "response": ai_response,
            "npc_id": npc_name,
            "player_id": player_id
        }

    def handle_memory(self, request: Dict[str, Any]) -> Dict[str, Any]:
        npc_name = request.get("npc_id")
        player_id = request.get("player_id")

        memory = memory_store.get_player_memory(npc_name, player_id)
        conversations = memory_store.get_conversations(npc_name, player_id, limit=5)

        return {
            "type": "memory",
            "memory": memory,
            "recent_conversations": conversations,
            "npc_id": npc_name,
            "player_id": player_id
        }

    def handle_config(self, request: Dict[str, Any]) -> Dict[str, Any]:
        npc_name = request.get("npc_id")
        npc_config = npc_manager.get_npc_config(npc_name)
        return {"type": "config", "config": npc_config, "npc_id": npc_name}

    def stop(self):
        self.running = False
        if self.server_socket:
            self.server_socket.close()
        print("AI服务器已停止")
