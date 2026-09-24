#!/usr/bin/env python3
"""Explicit UDP smoke client with correlation and bounded receive time."""
import argparse
import json
import socket
import sys
import time
import uuid
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.settings import load_settings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("type", choices=("chat", "config", "memory"))
    parser.add_argument("npc", nargs="?", default="li bai")
    parser.add_argument("message", nargs="?", default="你好")
    args = parser.parse_args()
    settings = load_settings()
    request = dict(type=args.type, npc_id=args.npc, player_id="ai_smoke_test",
                   player_name="测试玩家", message=args.message, context="通信测试",
                   request_id=uuid.uuid4().hex)
    deadline = time.monotonic() + settings.request_timeout + 10
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as client:
        client.sendto(json.dumps(request, ensure_ascii=False).encode("utf-8"), (settings.host, settings.port))
        while time.monotonic() < deadline:
            client.settimeout(max(0.1, deadline - time.monotonic()))
            data, _ = client.recvfrom(65535)
            response = json.loads(data.decode("utf-8"))
            if response.get("request_id") == request["request_id"]:
                print(json.dumps(response, ensure_ascii=False, indent=2))
                return 1 if response.get("error") else 0
    return 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError) as error:
        print(f"通信测试失败: {error}", file=sys.stderr)
        raise SystemExit(1)
