"""接入示例：独立 UDP 客户端，只用标准库；默认预览，不依赖 MUDLIB。"""
import argparse
import json
import socket
import threading
import time
import uuid


def request(payload, address=("127.0.0.1", 9999), *, long_mode=False, timeout=90, cancelled=None):
    """返回一个终态；长模式 timeout 不参与任务截止，取消事件由调用方持有。"""
    cancelled = cancelled if cancelled is not None else threading.Event()
    message = dict(payload)
    message.setdefault("request_id", uuid.uuid4().hex)
    token = uuid.uuid4().hex
    if long_mode:
        message.update(request_mode="long", request_token=token)
    encoded = json.dumps(message, ensure_ascii=False, allow_nan=False).encode("utf-8")
    if len(encoded) > 8192:
        raise ValueError("请求超过 8192 字节")
    address = (socket.gethostbyname(address[0]), address[1])
    control = dict(type="request_control", request_id=message["request_id"], request_token=token)
    started = time.monotonic()
    deadline = started + (30 if long_mode else timeout)
    next_send, retries, acknowledged, done = started + 5, 1, False, False
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as client:
        client.settimeout(.2)
        def send_control(action):
            client.sendto(json.dumps({**control, "action": action}).encode(), address)
        client.sendto(encoded, address)
        try:
            while True:
                if cancelled.is_set():
                    raise InterruptedError("调用方已取消")
                now = time.monotonic()
                if now >= deadline:
                    raise TimeoutError("通信失联" if long_mode else "短请求超时")
                if now >= next_send:
                    if long_mode and acknowledged:
                        send_control("renew")
                    elif retries:
                        client.sendto(encoded, address)
                        retries -= 1
                    next_send = now + 5
                try:
                    packet, origin = client.recvfrom(8193)
                except socket.timeout:
                    continue
                if origin != address or len(packet) > 8192:
                    continue
                try:
                    response = json.loads(packet)
                except (ValueError, UnicodeError):
                    continue
                if not isinstance(response, dict) or response.get("request_id") != message["request_id"]:
                    continue
                if long_mode and response.get("type") == "request_progress":
                    if (response.get("request_token") == token and response.get("lease_seconds") == 30
                            and response.get("heartbeat_seconds") == 5):
                        acknowledged = True
                        deadline = time.monotonic() + 30
                    continue
                if response.get("type") not in (message.get("type", "chat"), "error"):
                    continue
                if (long_mode and (acknowledged or response.get("type") != "error")
                        and response.get("request_token") != token):
                    continue
                if cancelled.is_set():
                    raise InterruptedError("调用方已取消")
                done = True
                return response
        finally:
            if long_mode and not done:
                send_control("cancel")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("payload", help='JSON，例如 {"type":"config","npc_id":"li bai"}')
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=9999)
    parser.add_argument("--long", action="store_true", dest="long_mode")
    parser.add_argument("--execute", action="store_true", help="明确发送；chat/agent_run 等可能产生真实模型消费")
    args = parser.parse_args()
    payload = json.loads(args.payload)
    if not args.execute:
        print("预览：未发送请求。确认目标服务与消费授权后添加 --execute。")
        return
    print(json.dumps(request(payload, (args.host, args.port), long_mode=args.long_mode), ensure_ascii=False))


if __name__ == "__main__":
    main()
