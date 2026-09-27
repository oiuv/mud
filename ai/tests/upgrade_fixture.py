"""Private child for verify_upgrade.py; imports exactly one exported release."""
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import sys
import threading
import time
from types import SimpleNamespace
from unittest.mock import Mock, patch


def main():
    code, root, phase = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
    sys.path.insert(0, str(code))
    from src.database import connect
    from src.npc.manager import NPCManager
    from src.npc.service import NPCService
    from src.settings import Settings
    from src.world.protocol import TEXT_FIELDS, content_key, digest, facts_digest
    from src.world.service import WorldService

    modern = hasattr(NPCManager, "create_context")
    assert modern == (phase in ("source_policy_change", "upgrade", "reupgrade"))
    assert Path(sys.modules["src.npc.service"].__file__).resolve().is_relative_to(code.resolve())
    data, world_root = root / "data", root / "world"
    roles = root / "roles.json"
    if phase == "seed":
        roles.write_text(json.dumps({"keeper": {"name": "守门人", "title": "山门守卫", "role": "守卫",
                        "memory_capacity": 100}}, ensure_ascii=False), encoding="utf-8")
        (world_root / "worlds").mkdir(parents=True)
        manifest = dict(world_id="test-upgrade", seed=42, generator_version=1,
                        catalog_version="test-v1", catalog_digest="a" * 64, content_version=1,
                        test_world=1, parameters=dict(coordinate_limit=1000000000, chunk_size=16, anchor_size=32))
        manifest["manifest_digest"] = digest(["illusion-manifest-v1", "test-upgrade", "42", "1", "test-v1",
                                              "a" * 64, "1", "1", "1000000000", "16", "32"])
        (world_root / "worlds/test-upgrade.json").write_text(json.dumps(manifest), encoding="utf-8")
    manifest = json.loads((world_root / "worlds/test-upgrade.json").read_text(encoding="utf-8"))
    # Preserve the original capability boundary for the data-compatibility cycle.
    # A separate phase checks the new source-enabled default against old caches.
    modern_options = {}
    if modern:
        source_root = root / "source"
        source_root.mkdir(exist_ok=True)
        modern_options = dict(skills_dir=code / "skills", source_root=source_root)
        if phase != "source_policy_change":
            modern_options["source_enabled"] = False
    settings = Settings(data_dir=data, roles_file=roles, help_dir=root / "unused-help",
                        world_content_dir=world_root, world_enabled=True, request_cache_ttl=3600,
                        **modern_options)
    knowledge, client = Mock(), Mock()
    knowledge.hybrid_search.return_value = []
    client.with_options.return_value = client
    entered, release = threading.Event(), threading.Event()
    pause = [False]

    def complete(**kwargs):
        if pause[0]:
            entered.set()
            assert release.wait(5), "In-flight fixture was not released"
        text = "守门人说：山门已开，少侠请进。"
        if modern:
            text = json.dumps(dict(status="completed", kind="conversation", parts=[{"text": text}], pending=[]),
                              ensure_ascii=False)
        return SimpleNamespace(choices=[SimpleNamespace(finish_reason="stop", message=SimpleNamespace(
            content=text, tool_calls=[]))], usage=SimpleNamespace(prompt_tokens=10, completion_tokens=5, total_tokens=15))

    client.chat.completions.create.side_effect = complete
    manager = NPCManager(settings=settings, knowledge=knowledge, client=client)
    npc = NPCService(settings, npc_manager=manager)
    generator = Mock(return_value=dict(schema_version=1, description="山风拂过松梢，松针轻轻落在岩坡上。", used_fact_ids=[]))
    world = WorldService(settings, generator=generator, start_worker=False)
    assert world.store is not None
    expected_file = root / "expected.json"
    expected = json.loads(expected_file.read_text(encoding="utf-8")) if expected_file.exists() else {"chats": {}, "rooms": {}}
    replayed_chats = len(expected["chats"])

    def chat(key):
        return dict(type="chat", request_id=key, npc_id="keeper", player_id="visitor",
                    player_name="少侠", message="你好" + key, context="山门")

    def room(x):
        facts = {key: "" for key in TEXT_FIELDS}
        facts.update(schema_version=1, name="苍岭·松岗", biome="ridge", biome_name="苍岭", patch="松岗",
                     theme="悔恨", role="wilderness", description="岩坡间夹着松树。", elevation=54000,
                     moisture=32000, temperature=32000, slope=100, road=1, landmarks=[])
        sha = facts_digest(facts, x, 0)
        md = manifest["manifest_digest"]
        return dict(world_id="test-upgrade", manifest_digest=md, x=x, y=0, facts=facts,
                    facts_digest=sha, content_key=content_key(md, x, 0, sha))

    def request_room(x):
        return world.process_request(dict(type="world_describe", request_id=str(x), **room(x)), time.monotonic() + 3)

    def snapshot():
        with connect(data / "conversations.db") as db:
            result = {table: [tuple(row) for row in db.execute("SELECT * FROM " + table)]
                      for table in ("conversations", "player_memories", "request_results", "summaries")}
        return result

    try:
        if phase == "source_policy_change":
            assert settings.source_enabled
            before = snapshot()
            rejected = 0
            for key in expected["chats"]:
                response = npc.process_request(chat(key), time.monotonic() + 80)
                assert response["type"] == "error" and response["code"] == "model_unavailable", response
                rejected += 1
            assert rejected > 0, "The policy-change probe needs an actual legacy cache"
            assert snapshot() == before
            assert client.chat.completions.create.call_count == generator.call_count == 0
            return dict(phase=phase, modern_runtime=True, source_enabled=True,
                        legacy_cache_rejections=rejected, fake_chat_calls=0, fake_world_calls=0,
                        business_snapshot_unchanged=True)
        # Both releases must replay every predecessor without another model/commit.
        before = snapshot()
        for key, response in expected["chats"].items():
            assert npc.process_request(chat(key), time.monotonic() + 80) == response
        for coordinate, sha in expected["rooms"].items():
            x = int(coordinate)
            assert request_room(x)["status"] == "ready"
            assert hashlib.sha256(world.store.publication_path(room(x)).read_bytes()).hexdigest() == sha
        assert snapshot() == before
        assert client.chat.completions.create.call_count == generator.call_count == 0

        if phase != "reupgrade":
            response = npc.process_request(chat(phase), time.monotonic() + 80)
            assert response["type"] == "chat" and not response["simulated"], response
            expected["chats"][phase] = response
            assert client.chat.completions.create.call_count == 1
        if phase == "seed":
            npc.history.save_summary("keeper", "visitor", 2, "少侠与守门人互致问候。")
        summary = npc.history.get_summary("keeper", "visitor")
        assert summary["through_id"] == 2 and summary["content"] == "少侠与守门人互致问候。"

        if phase in ("seed", "rollback"):
            x = -1 if phase == "seed" else 2
            assert request_room(x)["status"] == "accepted"
            assert world.tick()
            assert request_room(x)["status"] == "ready"
            assert generator.call_count == 1
            expected["rooms"][str(x)] = hashlib.sha256(world.store.publication_path(room(x)).read_bytes()).hexdigest()
        if phase == "seed":
            assert request_room(3)["status"] == "accepted"
            job = world.store.claim()
            assert job["content_key"] == room(3)["content_key"] and job["attempts"] == 1
            expected["lease"] = job["lease"]  # Emulate a stopped owner during a paid attempt.
        else:
            job = world.store.get(room(3)["content_key"])
            assert job["state"] == "retry_wait" and job["attempts"] == 1
            assert job["next_at"] >= expected["lease"]
        with world.store.connect() as db:
            assert db.execute("SELECT sum(calls) FROM daily_usage").fetchone()[0] == len(expected["rooms"]) + 1
            assert db.execute("SELECT count(*) FROM room_jobs").fetchone()[0] == len(expected["rooms"]) + 1

        cancelled = False
        if phase == "upgrade":
            from src.request_lifetime import RequestLifetime
            lifetime = RequestLifetime()
            before = snapshot()
            pause[0] = True
            with ThreadPoolExecutor(max_workers=1) as pool:
                pending = pool.submit(npc.process_request, chat("cancelled"), None, lifetime=lifetime)
                try:
                    assert entered.wait(3), "Request never reached the fake model"
                    lifetime.cancel()
                finally:
                    release.set()
                assert pending.result(5)["type"] == "error"
            assert snapshot() == before
            cancelled = True
        memory = npc.memory.get_player_memory("keeper", "visitor")
        assert memory["total_interactions"] == len(expected["chats"])
        assert len(npc.history.get_conversation_history("keeper", "visitor")) == 2 * len(expected["chats"])
        expected_file.write_text(json.dumps(expected, ensure_ascii=False), encoding="utf-8")
        return dict(phase=phase, modern_runtime=modern, source_enabled=False,
                    interactions=memory["total_interactions"],
                    replayed_chats=replayed_chats, ready_rooms=len(expected["rooms"]),
                    interrupted_attempts=1, fake_chat_calls=client.chat.completions.create.call_count,
                    fake_world_calls=generator.call_count, cancelled_without_commit=cancelled)
    finally:
        release.set()
        npc.close()
        manager.close()
        world.close()


if __name__ == "__main__":
    # Fixtures must remain offline even if somebody adds a real client by mistake.
    with patch("socket.socket.connect", side_effect=AssertionError("Network forbidden in upgrade fixture")):
        print(json.dumps(main(), ensure_ascii=False))
