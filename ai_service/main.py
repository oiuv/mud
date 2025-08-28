#!/usr/bin/env python3
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.udp_server import UDPServer

if __name__ == "__main__":
    print("AI NPC服务器启动...")
    server = UDPServer(host='127.0.0.1', port=9999)
    try:
        server.start()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.stop()
    except Exception as e:
        print(f"启动失败: {e}")
        if server:
            server.stop()
