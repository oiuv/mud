#!/usr/bin/env python3
import socket
import struct
import sys

class MSSPTester:
    def __init__(self, host, port):
        self.host = host
        self.port = int(port)
        self.socket = None
        
    def connect(self):
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.settimeout(10)
            self.socket.connect((self.host, self.port))
            print(f"已连接到 {self.host}:{self.port}")
            return True
        except Exception as e:
            print(f"连接失败: {e}")
            return False
    
    def send_mssp_request(self):
        # MSSP telnet协商序列
        # IAC DO MSSP
        mssp_request = bytes([0xFF, 0xFD, 0x46])  # 0x46 = 70 = TELNET_TELOPT_MSSP
        self.socket.send(mssp_request)
        print("已发送MSSP请求")
    
    def receive_data(self):
        data = b''
        try:
            while True:
                chunk = self.socket.recv(4096)
                if not chunk:
                    break
                data += chunk
                
                # 查找MSSP响应结束标记
                if b'\xFF\xF0' in data:  # IAC SE
                    break
        except socket.timeout:
            print("接收超时")
        return data
    
    def parse_mssp(self, data):
        """解析MSSP数据"""
        if not data:
            print("未收到数据")
            return {}
            
        # 查找MSSP子协商开始
        start = data.find(b'\xFF\xFA\x46')  # IAC SB MSSP
        if start == -1:
            print("未找到MSSP响应")
            return {}
        
        # 查找子协商结束
        end = data.find(b'\xFF\xF0', start)  # IAC SE
        if end == -1:
            print("MSSP响应不完整")
            return {}
        
        # 提取MSSP数据
        mssp_data = data[start+3:end]
        
        # 解析键值对
        stats = {}
        parts = mssp_data.split(b'\x01')  # MSSP_VAR = 0x01
        
        current_key = None
        for part in parts[1:]:  # 跳过第一个空部分
            sub_parts = part.split(b'\x02')  # MSSP_VAL = 0x02
            if len(sub_parts) == 2:
                key = sub_parts[0].decode('utf-8', errors='ignore')
                value = sub_parts[1].decode('utf-8', errors='ignore')
                stats[key] = value
        
        return stats
    
    def test(self):
        if not self.connect():
            return False
        
        self.send_mssp_request()
        data = self.receive_data()
        
        if data:
            stats = self.parse_mssp(data)
            if stats:
                print("\n=== MSSP服务器信息 ===")
                for key, value in sorted(stats.items()):
                    print(f"{key}: {value}")
                return True
            else:
                print("无法解析MSSP数据")
        else:
            print("未收到任何数据")
        
        return False
    
    def close(self):
        if self.socket:
            self.socket.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("用法: python mssp_tester.py <host> <port>")
        sys.exit(1)
    
    host, port = sys.argv[1], sys.argv[2]
    tester = MSSPTester(host, port)
    
    try:
        tester.test()
    finally:
        tester.close()