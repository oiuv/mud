import asyncio
import websockets
import json
import threading
import sys
from datetime import datetime

class MUDClient:
    def __init__(self, uri):
        self.uri = uri
        self.websocket = None
        self.connected = False
        
    async def connect(self):
        try:
            self.websocket = await websockets.connect(
                self.uri,
                subprotocols=['ascii']
            )
            self.connected = True
            print(f"✅ 已连接到MUD服务器: {self.uri}")
            print("🎮 MUD游戏客户端已启动")
            print("💡 输入 /help 查看可用命令")
            print("-" * 50)
            
            # 启动接收消息任务
            receive_task = asyncio.create_task(self.receive_messages())
            
            # 启动发送消息任务
            send_task = asyncio.create_task(self.send_messages())
            
            await asyncio.gather(receive_task, send_task)
            
        except Exception as e:
            print(f"❌ 连接错误: {e}")
            self.connected = False
            
    async def receive_messages(self):
        """接收服务器消息"""
        try:
            async for message in self.websocket:
                timestamp = datetime.now().strftime("%H:%M:%S")
                
                # 处理原始字节数据（Blob格式）
                if isinstance(message, bytes):
                    try:
                        text = message.decode('utf-8')
                        self.display_message(text, timestamp)
                    except UnicodeDecodeError:
                        # 如果UTF-8解码失败，尝试其他编码
                        try:
                            text = message.decode('gb2312')
                            self.display_message(text, timestamp)
                        except:
                            text = message.decode('latin-1')
                            self.display_message(text, timestamp)
                elif isinstance(message, str):
                    self.display_message(message, timestamp)
                else:
                    print(f"📨 [{timestamp}] 未知数据类型: {type(message)}")
                    
        except websockets.exceptions.ConnectionClosed:
            print("🔌 连接已关闭")
            self.connected = False
        except Exception as e:
            print(f"❌ 接收消息错误: {e}")
            self.connected = False

    def display_message(self, text, timestamp):
        """显示消息"""
        # 移除末尾的换行符
        text = text.rstrip('\r\n')
        
        # 如果是空消息，不显示
        if not text.strip():
            return
            
        print(text)
            
    async def send_messages(self):
        """发送用户输入到服务器"""
        loop = asyncio.get_event_loop()
        
        while self.connected:
            try:
                # 使用线程池读取输入，避免阻塞
                user_input = await loop.run_in_executor(None, input)
                
                if not self.connected:
                    break
                    
                if not user_input.strip():
                    # 空输入（直接按Enter）发送换行符，用于分页
                    await self.websocket.send('\n')
                    continue
                    
                # 处理特殊命令
                if user_input.startswith('/'):
                    await self.handle_command(user_input)
                else:
                    # 普通消息直接发送，确保以换行符结尾
                    message = user_input.strip()
                    if not message.endswith('\n'):
                        message += '\n'
                    await self.websocket.send(message)
                    
            except websockets.exceptions.ConnectionClosed:
                print("🔌 连接已关闭")
                break
            except Exception as e:
                print(f"❌ 发送消息错误: {e}")
                break
                
    async def handle_command(self, command):
        """处理特殊命令"""
        parts = command.strip().split(' ', 1)
        cmd = parts[0].lower()
        args = parts[1] if len(parts) > 1 else ""
        
        if cmd == '/help':
            print("\n📋 可用命令:")
            print("  /help - 显示此帮助")
            print("  /quit - 退出客户端")
            print("  /clear - 清屏")
            print("  其他命令直接输入即可发送")
            print()
            
        elif cmd == '/quit':
            print("👋 正在退出...")
            await self.websocket.close()
            self.connected = False
            
        elif cmd == '/clear':
            os.system('cls' if os.name == 'nt' else 'clear')
            
                
        else:
            # 未知命令直接发送
            message = command[1:].strip()
            if not message.endswith('\n'):
                message += '\n'
            await self.websocket.send(message)

import os

async def main():
    uri = "ws://mud.ren:8888"
    client = MUDClient(uri)
    await client.connect()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 客户端已退出")