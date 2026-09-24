"""Test-only backend for the isolated LPC driver. Never imports production .env."""
import json
import socket
import sys
import threading
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from ai.src.settings import Settings
from ai.src.udp_server import UDPServer
from ai.src.npc.service import NPCService
from ai.src.npc.manager import NPCManager, Reply

root = Path(sys.argv[1])


class FakeNPC:
    get_npc_config = lambda self, npc_id: {"name": "测试侠客", "memory_capacity": 0}
    update_player_memory = NPCManager.update_player_memory

    def generate_response(self, npc_id, player_name, message, *args):
        time.sleep(0.15 if message != "late" else 1)
        return Reply("测试回复：" + message, False)


class FixtureServer(UDPServer):
    def _send(self, response, address):
        if response.get("drop"):
            return
        if response.get("type") == "chat":
            super()._send({**response, "npc_id": "wrong", "response": "WRONG"}, address)
            super()._send({**response, "player_id": "wrong", "response": "WRONG"}, address)
            super()._send({**response, "response": []}, address)
        if response.get("inject"):
            super()._send({**response, "type": "wrong"}, address)
            super()._send({**response, "request_id": "unknown"}, address)
            super()._send({**response, "value": -7}, address)
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as other:
                other.sendto(json.dumps(response).encode(), address)
            self.server_socket.sendto(b"x" * 9000, address)
        super()._send(response, address)
        if response.get("duplicate"):
            super()._send(response, address)


settings = Settings(data_dir=root / "data", roles_file=root / "roles.json")
counts = {}
def echo(request, deadline):
    ident = request["request_id"]
    counts[ident] = counts.get(ident, 0) + 1
    return {"value": request.get("value"), "duplicate": True, "inject": request.get("inject"),
            "drop": request.get("drop") or (request.get("retry") and counts[ident] == 1),
            "attempts": counts[ident]}


port, paused = 0, False
while not (root / "stop").exists():
    npc = NPCService(settings, npc_manager=FakeNPC())
    server = FixtureServer(host="127.0.0.1", port=port, settings=settings)
    server.register(npc.request_types, npc.process_request, max_workers=4, timeout=5, close=npc.close)
    server.register("discard", lambda request, deadline: {}, max_workers=1, timeout=1)
    server.register("echo", echo, max_workers=4, timeout=2)
    thread = threading.Thread(target=server.start, kwargs={"stop_file": root / "stop"})
    thread.start()
    deadline = time.monotonic() + 5
    while not server.running and thread.is_alive() and time.monotonic() < deadline:
        time.sleep(0.01)
    if not server.running:
        raise RuntimeError("Test backend failed to start")
    port = server.port
    (root / ("resumed" if paused else "ready.json")).write_text(json.dumps({"port": port}), encoding="utf-8")
    while thread.is_alive():
        if not paused and (root / "pause-request").exists():
            server.running = False
            thread.join(5)
            if thread.is_alive():
                raise RuntimeError("Test backend failed to stop")
            paused = True
            (root / "paused").write_text("stopped", encoding="utf-8")
            while not (root / "resume-request").exists() and not (root / "stop").exists():
                time.sleep(0.02)
            break
        thread.join(0.05)
