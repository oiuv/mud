"""Temporary stores and fake models only; no API calls or live world data."""
import copy
import json
import os
import sqlite3
import tempfile
import threading
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import Mock, patch
from types import SimpleNamespace

from ai.src.llm import ModelUnavailable, complete_chat
from ai.src.protocol import RequestError
from ai.src.settings import Settings, load_settings, SERVICE_DIR
from ai.src.udp_server import UDPServer
from ai.src.world.generator import Generator, PROMPT_VERSION, SYSTEM_PROMPT
from ai.src.world.protocol import (TEXT_FIELDS, content_key, digest, facts_digest,
                                   manifest_digest, validate_payload, validate_prose)
from ai.src.world.service import WorldService
from ai.src.world.store import Store
from ai.scripts.world_content import backup, restore, main as content_cli


def sample_manifest():
    result = dict(world_id="test-prose", seed=42, generator_version=1,
                  catalog_version="test-v1", catalog_digest="a" * 64, content_version=1,
                  test_world=1, parameters=dict(coordinate_limit=1000000000, chunk_size=16, anchor_size=32))
    result["manifest_digest"] = digest(["illusion-manifest-v1", "test-prose", "42", "1", "test-v1",
                                        "a" * 64, "1", "1", "1000000000", "16", "32"])
    return result


def sample_payload(x=-1, y=0):
    facts = {key: "" for key in TEXT_FIELDS}
    facts.update(schema_version=1, name="苍岭·松岗", biome="ridge", biome_name="苍岭", patch="松岗",
                 theme="悔恨", role="wilderness", description="岩坡间夹着松树。", transition="",
                 elevation=54000, moisture=32000, temperature=32000, slope=100, road=1, landmarks=[])
    sha = facts_digest(facts, x, y)
    manifest = sample_manifest()["manifest_digest"]
    return dict(world_id="test-prose", manifest_digest=manifest, x=x, y=y, facts=facts,
                facts_digest=sha, content_key=content_key(manifest, x, y, sha))


def fake_prose(payload=None):
    return dict(schema_version=1, description="山风拂过松梢，细碎的松针落在岩坡上。", used_fact_ids=[])


class WorldTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.settings = Settings(data_dir=root / "ai", world_content_dir=root / "world", world_enabled=True)
        (self.settings.world_content_dir / "worlds").mkdir(parents=True)
        self.manifest = sample_manifest()
        (self.settings.world_content_dir / "worlds/test-prose.json").write_text(json.dumps(self.manifest), encoding="utf-8")
        self.model = Mock(side_effect=fake_prose)
        self.service = WorldService(self.settings, generator=self.model, start_worker=False)
        self.addCleanup(self.service.close)
        self.assertIsNotNone(self.service.store)
        self.store = self.service.store

    def submit(self, payload=None):
        return self.service.process_request(dict(type="world_describe", request_id="visit", **(payload or sample_payload())), time.monotonic() + 3)

    def immediate_retry(self, key):
        with self.store.connect() as db:
            db.execute("UPDATE room_jobs SET next_at=0 WHERE content_key=?", (key,))

    def test_framing_order_vectors_and_strict_types(self):
        payload = sample_payload()
        self.assertEqual(payload["content_key"], "0e267308df122f67bb3fc7ba2ad64d6eec406e757f821122cbc09ddc1caae863")
        self.assertEqual(manifest_digest(self.manifest), payload["manifest_digest"])
        self.assertEqual(validate_payload(payload), payload)
        reversed_facts = dict(reversed(list(payload["facts"].items())))
        self.assertEqual(facts_digest(reversed_facts, -1, 0), payload["facts_digest"])
        self.assertNotEqual(digest(["a", "bc"]), digest(["ab", "c"]))
        for key, value in (("x", True), ("y", 1.0), ("world_id", "../bad"), ("facts_digest", "b" * 64), ("player_name", "秘密")):
            bad = {**payload, key: value}
            with self.subTest(key=key), self.assertRaises((ValueError, TypeError)):
                validate_payload(bad)
        bad = copy.deepcopy(payload)
        bad["facts"]["road"] = True
        with self.assertRaises(ValueError):
            validate_payload(bad)

    def test_concurrent_dedup_persistence_and_publication(self):
        with ThreadPoolExecutor(max_workers=8) as pool:
            replies = list(pool.map(lambda _: self.submit(), range(16)))
        self.assertTrue(all(reply["status"] == "accepted" for reply in replies))
        with self.store.connect() as db:
            self.assertEqual(db.execute("SELECT count(*) FROM room_jobs").fetchone()[0], 1)
        self.assertTrue(self.service.tick())
        self.assertEqual(self.model.call_count, 1)
        self.assertEqual(self.submit()["status"], "ready")
        payload = sample_payload()
        path = self.store.publication_path(payload)
        self.assertEqual(path.parent.name, "-1_0")
        snapshot = json.loads(path.read_text(encoding="utf-8"))
        self.assertEqual(snapshot["description"], fake_prose()["description"])
        self.assertFalse(self.service.tick())
        self.assertEqual(self.model.call_count, 1)

    def test_model_call_holds_no_database_lock_and_does_not_wait_for_player(self):
        def generate(payload):
            with ThreadPoolExecutor(max_workers=1) as pool:
                self.assertEqual(pool.submit(self.submit, payload).result(1)["status"], "pending")
            return fake_prose()
        self.model.side_effect = generate
        self.submit()
        self.service.tick()
        self.assertEqual(self.submit()["status"], "ready")

    def test_bad_result_never_published_and_attempts_budgeted(self):
        self.model.side_effect = ValueError("malformed output")
        payload = sample_payload()
        self.submit(payload)
        for _ in range(3):
            self.service.tick()
            self.immediate_retry(payload["content_key"])
        self.assertFalse(self.service.tick())
        self.assertEqual(self.submit()["status"], "failed")
        self.assertEqual(self.model.call_count, 3)
        self.assertFalse(self.store.publication_path(payload).exists())
        with self.store.connect() as db:
            self.assertEqual(db.execute("SELECT sum(calls) FROM daily_usage").fetchone()[0], 3)

    def test_quota_queue_storage_and_chat_backpressure(self):
        self.settings.world_queue_limit = 1
        self.submit()
        self.assertEqual(self.submit(sample_payload(2))["status"], "retry_later")
        self.service.chat_busy = lambda: True
        self.assertFalse(self.service.tick())
        self.model.assert_not_called()
        self.service.chat_busy = lambda: False
        self.settings.world_daily_limit = 1
        self.service.tick()
        self.assertEqual(self.submit(sample_payload(2))["status"], "retry_later")
        self.assertEqual(self.submit()["status"], "ready")
        self.settings.world_daily_limit = 10
        with patch.object(self.store, "space_available", return_value=False):
            self.assertEqual(self.submit(sample_payload(2))["status"], "retry_later")
            self.assertFalse(self.service.tick())

    def test_atomic_publication_failure_repair_and_restart_without_generation(self):
        payload = sample_payload()
        self.submit()
        with patch("ai.src.world.store.os.replace", side_effect=OSError("disk error")):
            self.service.tick()
        row = self.store.get(payload["content_key"])
        self.assertEqual(row["state"], "ready")
        self.assertFalse(row["published"])
        self.assertFalse(self.store.publication_path(payload).exists())
        self.immediate_retry(payload["content_key"])
        self.service.tick()
        path = self.store.publication_path(payload)
        expected = path.read_bytes()
        for corrupt in (None, b"{invalid"):
            if corrupt is None:
                path.unlink()
            else:
                path.write_bytes(corrupt)
            self.assertEqual(self.submit()["status"], "pending")
            self.service.tick()
            self.assertEqual(path.read_bytes(), expected)
        original = self.store.get(payload["content_key"])
        self.service.close()
        self.settings.chat_model = "changed-model"
        with patch("ai.src.world.service.PROMPT_VERSION", "future-prompt"):
            restarted = WorldService(self.settings, generator=self.model, start_worker=False)
            self.addCleanup(restarted.close)
            self.assertEqual(restarted.process_request(dict(type="world_describe", request_id="new", **payload), time.monotonic() + 3)["status"], "ready")
            restarted.tick()
        self.assertEqual(restarted.store.get(payload["content_key"])["prompt"], original["prompt"])
        self.assertEqual(restarted.store.get(payload["content_key"])["model"], original["model"])
        self.assertEqual(path.read_bytes(), expected)
        self.assertEqual(self.model.call_count, 1)

    def test_process_lock_and_interrupted_lease(self):
        with self.assertRaises(OSError):
            Store(self.settings)
        self.submit()
        row = self.store.claim()
        self.assertEqual(row["attempts"], 1)
        self.service.close()
        restarted = Store(self.settings)
        self.addCleanup(restarted.close)
        recovered = restarted.get(row["content_key"])
        self.assertEqual(recovered["state"], "retry_wait")
        self.assertGreaterEqual(recovered["next_at"], row["lease"])
        self.assertIsNone(restarted.claim())

    def test_429_defers_all_world_calls(self):
        self.model.side_effect = ModelUnavailable("api_error", status_code=429, retry_after=900)
        self.submit()
        self.submit(sample_payload(2))
        self.service.tick()
        self.assertFalse(self.service.tick())
        row = self.store.get(sample_payload()["content_key"])
        self.assertGreater(row["next_at"], time.time() + 890)
        self.assertEqual(self.model.call_count, 1)

    def test_invalid_manifest_missing_directory_and_disabled_model(self):
        payload = sample_payload()
        payload["manifest_digest"] = "b" * 64
        payload["content_key"] = content_key(payload["manifest_digest"], payload["x"], payload["y"], payload["facts_digest"])
        with self.assertRaises(RequestError):
            self.submit(payload)
        self.settings.world_enabled = False
        disabled = WorldService(self.settings)
        self.addCleanup(disabled.close)
        self.assertIsNone(disabled.store)
        self.settings.world_enabled = True
        unconfigured = WorldService(self.settings)
        self.addCleanup(unconfigured.close)
        self.assertIsNone(unconfigured.store)
        self.settings.world_content_dir = Path(self.temp.name) / "missing"
        missing = WorldService(self.settings, generator=self.model)
        self.addCleanup(missing.close)
        self.assertIsNone(missing.store)

    def test_snapshot_output_rejects_injections_unicode_limits_and_unknown_facts(self):
        facts = sample_payload()["facts"]
        bad_values = ["", "x" * 361, "x\x1b[31m", "x\u202ey", "```json\nx", "<|system|>", "a\nb\nc\nd", "API文案"]
        for text in bad_values:
            with self.subTest(text=text[:15]), self.assertRaises(ValueError):
                validate_prose({**fake_prose(), "description": text}, facts)
        for bad in ({**fake_prose(), "exits": {}}, {**fake_prose(), "schema_version": True},
                    {**fake_prose(), "used_fact_ids": ["unknown"]}, '{"schema_version":1,"schema_version":1}'):
            with self.assertRaises(ValueError):
                validate_prose(bad, facts)

    def test_prompt_only_sends_facts_and_uses_world_deadline(self):
        with patch("ai.src.world.generator.create_chat_client", return_value=Mock()), \
                patch("ai.src.world.generator.complete_chat", return_value=json.dumps(fake_prose())) as call:
            generator = Generator(self.settings)
            generator(sample_payload())
            self.assertEqual(call.call_args.kwargs["timeout"], 90)
            self.assertEqual(call.call_args.kwargs["operation"], "world_describe")
            self.assertEqual(json.loads(call.call_args.args[2][1]["content"]), sample_payload()["facts"])
            generator.close()

    def test_creative_details_and_metaphor_survive_generation_and_publication(self):
        # Hand-authored fixtures: no live model output or game data in the test suite.
        descriptions = (
            "石坡一侧岩面陡立，松根沿细缝盘绕，苔痕边泛着松脂清香。",
            "枝影交错如两名高手对峙，松涛低回，仿佛无形劲敌正窥着这片山岗。",
            "风穿过松梢，碎石旁一层针叶轻颤，石隙透着凉意，令人顿生争胜之念。",
        )
        with patch("ai.src.world.generator.create_chat_client", return_value=Mock()), \
                patch("ai.src.world.generator.complete_chat") as completion:
            generator = Generator(self.settings)
            self.addCleanup(generator.close)
            self.service.generator = generator
            for index, text in enumerate(descriptions):
                with self.subTest(index=index):
                    payload = sample_payload(index)
                    expected = dict(schema_version=1, description=text, used_fact_ids=[])
                    completion.return_value = json.dumps(expected, ensure_ascii=False)
                    self.assertNotIn(text, payload["facts"]["description"])
                    self.assertEqual(validate_prose(expected, payload["facts"]), expected)
                    self.submit(payload)
                    self.assertTrue(self.service.tick({payload["content_key"]}))
                    row = self.store.get(payload["content_key"])
                    self.assertEqual(row["prompt"], PROMPT_VERSION)
                    self.assertEqual(row["state"], "ready")
                    snapshot = json.loads(self.store.publication_path(payload).read_text(encoding="utf-8"))
                    self.assertEqual(snapshot["description"], text)
                    self.assertEqual(snapshot["used_fact_ids"], [])
            self.assertEqual(completion.call_count, len(descriptions))

    def test_prompt_states_creative_space_without_relaxing_output_contract(self):
        # This checks the prompt contract, not whether a real model follows it.
        self.assertEqual(PROMPT_VERSION, "illusion-prose-v2")
        for guidance in ("允许合理补白", "未逐项列在输入中不是禁写理由", "守住既定事实",
                         "局部岩面不代表整格地势", "不承诺规则未提供", "不得增加其他字段"):
            self.assertIn(guidance, SYSTEM_PROMPT)
        self.assertNotIn("不得描写当前天气", SYSTEM_PROMPT)
        self.assertNotIn("只能依据提供的", SYSTEM_PROMPT)

    def test_short_route_independent_of_busy_chat_and_model(self):
        server = UDPServer(settings=self.settings, port=0)
        entered, release = threading.Event(), threading.Event()
        def chat(request, deadline):
            entered.set()
            release.wait(2)
            return {"response": "ok"}
        server.register("chat", chat, max_workers=1, timeout=3)
        server.register(self.service.request_types, self.service.process_request, max_workers=2, timeout=3)
        thread = threading.Thread(target=server.process_request, args=({"type": "chat"},))
        thread.start()
        try:
            self.assertTrue(entered.wait(1))
            self.assertTrue(server.capability_active("chat"))
            response = server.process_request(dict(type="world_describe", request_id="short", **sample_payload()))
            self.assertEqual(response["status"], "accepted")
            self.model.assert_not_called()
        finally:
            release.set()
            thread.join(3)
            server.stop()

    def test_consistent_backup_restore_reuses_ready_text(self):
        self.submit()
        self.service.tick()
        saved = Path(self.temp.name) / "backup"
        backup(self.store, saved)
        target = Settings(data_dir=Path(self.temp.name) / "restored-ai",
                          world_content_dir=Path(self.temp.name) / "restored-world", world_enabled=True)
        restore(target, saved)
        with self.assertRaises(ValueError):
            restore(target, saved)
        restored = Store(target)
        self.addCleanup(restored.close)
        row = restored.get(sample_payload()["content_key"])
        self.assertTrue(row["published"])
        self.assertFalse(restored.needs_repair(row))
        self.assertEqual(self.model.call_count, 1)

    def test_cli_dry_run_has_no_writes_or_calls(self):
        path = Path(self.temp.name) / "payload.json"
        path.write_text(json.dumps(sample_payload()), encoding="utf-8")
        with patch("ai.scripts.world_content.load_settings", return_value=self.settings), \
                patch("ai.scripts.world_content.WorldService") as service, \
                patch("builtins.print"):
            self.assertEqual(content_cli(["describe", str(path)]), 0)
            service.assert_not_called()
        self.model.assert_not_called()

    def test_live_batch_only_claims_selected_keys(self):
        self.submit()
        selected = sample_payload(2)
        self.submit(selected)
        self.service.tick({selected["content_key"]})
        self.assertEqual(self.model.call_count, 1)
        self.assertEqual(self.model.call_args.args[0]["content_key"], selected["content_key"])
        self.assertEqual(self.store.get(sample_payload()["content_key"])["state"], "queued")

    def test_slow_model_does_not_block_chat_or_duplicate_ticks(self):
        entered, release = threading.Event(), threading.Event()
        def generate(payload):
            entered.set()
            release.wait(3)
            return fake_prose()
        self.model.side_effect = generate
        self.submit()
        thread = threading.Thread(target=self.service.tick)
        thread.start()
        try:
            self.assertTrue(entered.wait(1))
            self.assertFalse(self.service.tick())
            server = UDPServer(settings=self.settings, port=0)
            server.register("chat", lambda request, deadline: {"response": "答复"}, max_workers=1, timeout=3)
            self.addCleanup(server.stop)
            self.assertEqual(server.process_request({"type": "chat"})["response"], "答复")
            self.assertEqual(self.submit()["status"], "pending")
        finally:
            release.set()
            thread.join(3)

    def test_deadline_oversize_and_failed_durable_commit_are_not_accepted(self):
        request = dict(type="world_describe", request_id="short", **sample_payload())
        with self.assertRaises(TimeoutError):
            self.service.process_request(request, time.monotonic() - 1)
        with patch.object(self.store, "submit", side_effect=sqlite3.OperationalError("disk full")):
            self.assertEqual(self.service.process_request(request, time.monotonic() + 3)["status"], "retry_later")
        large = copy.deepcopy(request)
        for key in TEXT_FIELDS:
            large["facts"][key] = "字" * 600
        large["facts_digest"] = facts_digest(large["facts"], large["x"], large["y"])
        large["content_key"] = content_key(large["manifest_digest"], large["x"], large["y"], large["facts_digest"])
        with self.assertRaises(RequestError):
            self.service.process_request(large, time.monotonic() + 3)
        self.model.assert_not_called()


class WorldSettingsTests(unittest.TestCase):
    def test_shared_model_exposes_safe_retry_and_usage_metadata(self):
        client = Mock()
        client.with_options.return_value = client
        error = RuntimeError("private provider response")
        error.status_code = 429
        error.response = SimpleNamespace(headers={"retry-after": "123"})
        client.chat.completions.create.side_effect = error
        with self.assertRaises(ModelUnavailable) as raised:
            complete_chat(Settings(), client, [], timeout=90, operation="world_describe")
        self.assertEqual(raised.exception.status_code, 429)
        self.assertEqual(raised.exception.retry_after, 123)
        self.assertNotIn("private", str(raised.exception))
        client.chat.completions.create.side_effect = None
        client.chat.completions.create.return_value = SimpleNamespace(
            choices=[SimpleNamespace(finish_reason="stop", message=SimpleNamespace(content="正文"))],
            usage=SimpleNamespace(prompt_tokens=10, completion_tokens=5, total_tokens=15))
        usage = {}
        self.assertEqual(complete_chat(Settings(), client, [], usage_callback=usage.update), "正文")
        self.assertEqual(usage, {"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15})

    def test_defaults_environment_precedence_and_relative_paths(self):
        with tempfile.TemporaryDirectory() as directory:
            env = Path(directory) / "test.env"
            env.write_text("WORLD_ENABLED=true\nWORLD_DAILY_LIMIT=2\nWORLD_CONTENT_DIR=../example-world\n", encoding="utf-8")
            with patch.dict(os.environ, {"WORLD_DAILY_LIMIT": "7"}, clear=True):
                settings = load_settings(env)
            self.assertTrue(settings.world_enabled)
            self.assertEqual(settings.world_daily_limit, 7)
            self.assertEqual(settings.world_content_dir, SERVICE_DIR / "../example-world")
        for kwargs in ({"world_timeout": 91}, {"world_lease": 100}, {"world_queue_limit": 257},
                       {"world_short_workers": 5}, {"world_daily_limit": 1.5}, {"world_timeout": float("nan")}):
            with self.assertRaises(ValueError):
                Settings(**kwargs)


if __name__ == "__main__":
    unittest.main()
