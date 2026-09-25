"""Real UDP + SQLite + publisher with a deterministic fake model. Never load .env."""
import json
import sys
import threading
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from ai.src.settings import Settings
from ai.src.udp_server import UDPServer
from ai.src.world.protocol import validate_payload, manifest_digest, facts_digest
from ai.src.world.service import WorldService

root = Path(sys.argv[1]).resolve()
if not root.name.startswith("mud-illusion-"):
    raise ValueError("fixture requires temporary illusion sandbox")
calls = []


def generate(payload):
    calls.append(payload["content_key"])
    (root / "data/model-calls.json").write_text(json.dumps(calls), encoding="utf-8")
    time.sleep(5)
    return {"schema_version": 1, "description": "松风掠过岩坡，针叶簌簌而落。", "used_fact_ids": []}


settings = Settings(data_dir=root / "ai-data", world_content_dir=root / "data/illusion_world", world_enabled=True)
(settings.world_content_dir / "worlds").mkdir(parents=True, exist_ok=True)
(root / "data/model-calls.json").write_text("[]", encoding="utf-8")
class FaultServer(UDPServer):
    def _send(self, response, address):
        if (root / "data/silent-backend").exists():
            return
        ident = response.get("request_id")
        if response.get("content_key") and ident not in sent:
            sent.add(ident)
            super()._send({**response, "content_key": "0" * 64}, address)
            super()._send({**response, "request_id": "expired-id"}, address)
            return  # lose the first correct acknowledgement
        super()._send(response, address)
        super()._send(response, address)  # duplicate terminal reply


sent = set()
server = FaultServer(settings=settings, port=0)
world = WorldService(settings, generator=generate, chat_busy=lambda: (root / "data/pause-model").exists())
if world.store is None:
    raise RuntimeError("world fixture store unavailable")
server.register(world.request_types, world.process_request, max_workers=2, timeout=3, close=world.close)
thread = threading.Thread(target=server.start, kwargs={"stop_file": root / "world-stop"})
thread.start()
end = time.monotonic() + 5
while not server.running and thread.is_alive() and time.monotonic() < end:
    time.sleep(0.01)
if not server.running:
    raise RuntimeError("world UDP fixture failed")
(root / "world-ready.json").write_text(json.dumps({"port": server.port}), encoding="utf-8")
thread.join()
vectors = json.loads((root / "data/content-vectors.json").read_text(encoding="utf-8"))
manifest_digest(vectors["world"])
for payload in vectors["payloads"]:
    validate_payload(payload)
    reversed_facts = dict(reversed(list(payload["facts"].items())))
    if facts_digest(reversed_facts, payload["x"], payload["y"]) != payload["facts_digest"]:
        raise AssertionError("mapping order changed facts digest")
if len(calls) != 1:
    raise AssertionError(f"expected one deduplicated model call, got {len(calls)}")
print(f"ILLUSION CONTENT: {len(vectors['payloads'])} LPC/Python vectors, 1 model call", flush=True)
