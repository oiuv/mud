#!/usr/bin/env python3
"""直接诊断问答模型，复用游戏的模型调用；不读取知识库或写入玩家历史。"""
import argparse
import logging
import math
from pathlib import Path
import sys
import time
from urllib.parse import urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.llm import ModelUnavailable, create_chat_client
from src.diagnostics import diagnose_text
from src.settings import load_settings


def positive_timeout(value):
    number = float(value)
    if not math.isfinite(number) or number <= 0:
        raise argparse.ArgumentTypeError("超时必须是大于 0 的有限秒数")
    return number


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("question", nargs="?", default="请只回答：连接正常。", help="默认发送简短连通性问题")
    parser.add_argument("--timeout", type=positive_timeout, help="本次问答超时秒数，仍受 REQUEST_TIMEOUT 约束")
    parser.add_argument("--config-only", action="store_true", help="只显示脱敏配置，不调用 API")
    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    for name in ("openai", "httpx", "httpcore", "httpx2", "httpcore2"):
        logging.getLogger(name).setLevel(logging.WARNING)
    client = None
    try:
        settings = load_settings()
        if args.timeout is not None:
            settings.chat_timeout = args.timeout
        print(f"OPENAI_MODEL={settings.chat_model}", flush=True)
        print(f"问答主机：{urlsplit(settings.chat_base_url).hostname}", flush=True)
        print(f"向量主机：{urlsplit(settings.embedding_base_url).hostname}", flush=True)
        print(f"CHAT_TIMEOUT={settings.chat_timeout:g}；REQUEST_TIMEOUT={settings.request_timeout:g}", flush=True)
        print("OPENAI_API_KEY：" + ("已配置" if settings.chat_api_key and
                                  not settings.chat_api_key.startswith("your-") else "未配置"), flush=True)
        if args.config_only:
            return 0
        if not args.question.strip() or len(args.question) > settings.max_message_chars:
            raise ValueError("提问不能为空且不能超过配置的长度限制")
        print("将发送一次问答请求（消耗模型额度），跳过知识库、NPC 提示词和历史。", flush=True)
        client = create_chat_client(settings)
        started = time.monotonic()
        outcome = diagnose_text(settings, client, args.question)
        if outcome.result.status != "completed":
            raise ModelUnavailable(outcome.result.code)
        print(f"调用成功，耗时 {time.monotonic() - started:.2f} 秒", flush=True)
        print(outcome.result.value)
        return 0
    except ModelUnavailable as error:
        print("AI回答超时，请稍后再试。" if error.code in ("timeout", "deadline", "tool_timeout")
              else "AI暂时无法回答，请稍后再试。", file=sys.stderr)
        print("查看上方 error/cause：ConnectTimeout 检查目标域名与网络；"
              "ReadTimeout 表示等待响应超时，仍需检查网关和模型耗时。", file=sys.stderr)
        return 1
    except Exception as error:
        # Configuration/SDK errors can include URLs or credentials; print the type only.
        print(f"诊断失败（{type(error).__name__}），请检查 .env 配置。", file=sys.stderr)
        return 1
    finally:
        if client is not None:
            client.close()


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    raise SystemExit(main())
