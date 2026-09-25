#!/usr/bin/env python3
"""Run with python ai/main.py or python -m ai.main."""
import argparse
import logging
import signal
from pathlib import Path

try:
    from .src.settings import load_settings
    from .src.udp_server import UDPServer
except ImportError:
    from src.settings import load_settings
    from src.udp_server import UDPServer


def create_server(settings):
    server = UDPServer(settings=settings)
    pending = None
    try:
        if "npc" in settings.enabled_modules:
            if __package__:
                from .src.npc.service import NPCService
            else:
                from src.npc.service import NPCService
            pending = NPCService(settings)
            server.register(pending.request_types, pending.process_request, max_workers=settings.max_workers,
                            timeout=settings.request_timeout, close=pending.close)
            pending = None
        if "world" in settings.enabled_modules:
            if __package__:
                from .src.world.service import WorldService
            else:
                from src.world.service import WorldService
            pending = WorldService(settings, chat_busy=lambda: server.capability_active("chat"))
            server.register(pending.request_types, pending.process_request, max_workers=settings.world_short_workers,
                            timeout=settings.world_short_timeout, close=pending.close)
            pending = None
    except Exception:
        try:
            server.stop()
        finally:
            if pending is not None:
                pending.close()
        raise
    return server


def request_shutdown(signum, frame):
    # Ignore repeated TERM while the worker pool finishes its current requests.
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    logging.info("Received SIGTERM; waiting for active requests to finish")
    raise KeyboardInterrupt


def main():
    parser = argparse.ArgumentParser(description="AI服务器")
    parser.add_argument("-d", "--debug", action="store_true")
    parser.add_argument("--stop-file", type=Path, help=argparse.SUPPRESS)
    args = parser.parse_args()
    settings = load_settings()
    logging.basicConfig(level=logging.DEBUG if args.debug or settings.debug else logging.INFO,
                        format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    # Avoid SDK wire logs exposing prompts or credentials in debug mode.
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("httpx2").setLevel(logging.WARNING)
    logging.getLogger("httpcore2").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    server = None
    previous_handler = signal.signal(signal.SIGTERM, request_shutdown)
    try:
        server = create_server(settings)
        server.start(stop_file=args.stop_file)
    except KeyboardInterrupt:
        pass
    except Exception as error:
        logging.error("AI service failed: error=%s", type(error).__name__)
        return 1
    finally:
        try:
            if server:
                server.stop()
        finally:
            signal.signal(signal.SIGTERM, previous_handler)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
