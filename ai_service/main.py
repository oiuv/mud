#!/usr/bin/env python3
import sys
import os
import logging
import argparse

# 解析命令行参数
parser = argparse.ArgumentParser(description='AI NPC服务器')
parser.add_argument('-d', '--debug', action='store_true', help='启用调试模式')
args = parser.parse_args()

# 设置日志级别 - 命令行参数优先于环境变量
DEBUG = args.debug or os.getenv('DEBUG', 'false').lower() == 'true'
logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.WARNING,
    format='%(asctime)s - %(message)s',
    datefmt='%H:%M:%S'
)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.udp_server import UDPServer

if __name__ == "__main__":
    logging.info("AI NPC服务器启动...")
    server = UDPServer(host='127.0.0.1', port=9999)
    try:
        server.start()
    except KeyboardInterrupt:
        logging.info("服务器已停止")
        server.stop()
    except Exception as e:
        logging.error(f"启动失败: {e}")
        if server:
            server.stop()
