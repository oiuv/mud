"""World maintenance uses isolated stores and fake models, never live data."""
import io
import json
import tempfile
import time
import unittest
from contextlib import redirect_stderr, redirect_stdout
from dataclasses import replace
from pathlib import Path
from unittest.mock import Mock, patch

from ai.scripts.ops_world_content import main
from ai.src.settings import Settings
from ai.src.world.service import WorldService
from ai.src.world.store import Store
from ai.tests.test_world import fake_prose, sample_manifest, sample_payload


class WorldOperationsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.settings = Settings(data_dir=root / "ai", world_content_dir=root / "world", world_enabled=True)
        manifests = self.settings.world_content_dir / "worlds"
        manifests.mkdir(parents=True)
        (manifests / "test-prose.json").write_text(json.dumps(sample_manifest()), encoding="utf-8")
        self.model = Mock(side_effect=fake_prose)
        self.service = WorldService(self.settings, generator=self.model, start_worker=False)
        self.addCleanup(self.service.close)
        self.store = self.service.store
        self.payload = sample_payload()
        self.key = self.payload["content_key"]

    def submit(self, payload=None):
        return self.store.submit(payload or self.payload, time.monotonic() + 3)

    def cli(self, *args):
        out, err = io.StringIO(), io.StringIO()
        with patch("ai.scripts.ops_world_content.load_settings", return_value=self.settings), \
                patch("ai.scripts.ops_world_content.WorldService") as service, \
                redirect_stdout(out), redirect_stderr(err):
            code = main(list(args))
            service.assert_not_called()
        return code, out.getvalue(), err.getvalue()

    def fail_early(self):
        self.submit()
        self.store.claim()
        self.store.fail(self.key, "interrupted", delay=300)
        # An explicit operator hold with an unused attempt, not a reset of history.
        with self.store.connect() as db:
            db.execute("UPDATE room_jobs SET state='failed' WHERE content_key=?", (self.key,))
        return self.store.get(self.key)

    def test_status_by_coordinate_is_read_only_while_worker_owns_store(self):
        self.submit()
        self.submit(sample_payload(2, 3))
        original = self.store.get(self.key)
        with patch("ai.scripts.ops_world_content.Store", side_effect=AssertionError("read-only query opened writer")):
            code, output, _ = self.cli("status", "--world", "test-prose", "--x", "-1", "--y", "0")
        self.assertEqual(code, 0)
        rows, _ = json.JSONDecoder().raw_decode(output)
        self.assertEqual(len(rows), 1)
        self.assertEqual((rows[0]["world_id"], rows[0]["x"], rows[0]["y"]), ("test-prose", -1, 0))
        self.assertEqual(rows[0]["content_key"], self.key)
        self.assertIn("Configured limits:", output)
        self.assertIn("UTC usage:", output)
        self.assertEqual(self.store.get(self.key), original)
        self.model.assert_not_called()

    def test_status_key_pagination_missing_and_invalid_selectors(self):
        self.submit()
        other = sample_payload(2, 3)
        self.submit(other)
        code, output, _ = self.cli("status", "--key", other["content_key"])
        self.assertEqual(code, 0)
        self.assertEqual(json.JSONDecoder().raw_decode(output)[0][0]["x"], 2)
        code, output, _ = self.cli("status", "--world", "test-prose", "--limit", "1", "--offset", "1")
        self.assertEqual(code, 0)
        self.assertEqual(len(json.JSONDecoder().raw_decode(output)[0]), 1)
        code, output, _ = self.cli("status", "--world", "absent")
        self.assertEqual(code, 0)
        self.assertEqual(json.JSONDecoder().raw_decode(output)[0], [])
        for args in (("--x", "0"), ("--x", "0", "--y", "0"), ("--limit", "0"), ("--offset", "-1")):
            with self.subTest(args=args):
                self.assertEqual(self.cli("status", *args)[0], 1)
        self.model.assert_not_called()

    def test_status_missing_database_does_not_create_it(self):
        self.settings.data_dir = Path(self.temp.name) / "absent"
        self.assertEqual(self.cli("status")[0], 1)
        self.assertFalse(self.settings.data_dir.exists())

    def test_explicit_retry_preserves_usage_error_and_backoff(self):
        before = self.fail_early()
        self.assertIsNone(self.store.claim())
        row = self.store.retry_failed(self.key)
        self.assertEqual(row["state"], "retry_wait")
        for field in ("attempts", "next_at", "error", "payload"):
            self.assertEqual(row[field], before[field])
        self.assertIsNone(self.store.claim())
        claimed = self.store.claim(now=row["next_at"] + 1)
        self.assertEqual(claimed["attempts"], 2)
        with self.store.connect() as db:
            self.assertEqual(db.execute("SELECT sum(calls) FROM daily_usage").fetchone()[0], 2)
            self.assertEqual(db.execute("SELECT count(*) FROM attempt_usage").fetchone()[0], 1)
        self.model.assert_not_called()

    def test_retry_rejects_exhausted_missing_live_and_stored_prose(self):
        with self.assertRaises(ValueError):
            self.store.retry_failed("absent")
        self.submit()
        for state, attempts, prose, published in (
                ("queued", 0, None, 0), ("running", 1, None, 0), ("retry_wait", 1, None, 0),
                ("failed", 3, None, 0), ("ready", 1, "{}", 1), ("failed", 1, "{}", 0)):
            with self.subTest(state=state, attempts=attempts, prose=prose):
                with self.store.connect() as db:
                    db.execute("UPDATE room_jobs SET state=?,attempts=?,prose=?,published=? WHERE content_key=?",
                               (state, attempts, prose, published, self.key))
                before = self.store.get(self.key)
                with self.assertRaises(ValueError):
                    self.store.retry_failed(self.key)
                self.assertEqual(self.store.get(self.key), before)
        self.model.assert_not_called()

    def test_retry_honors_daily_queue_storage_and_manifest(self):
        original = self.fail_early()
        self.settings.world_daily_limit = 1
        with self.assertRaises(ValueError):
            self.store.retry_failed(self.key)
        self.settings.world_daily_limit = 300
        self.settings.world_queue_limit = 1
        self.submit(sample_payload(2))
        with self.assertRaises(ValueError):
            self.store.retry_failed(self.key)
        self.settings.world_queue_limit = 256
        with patch.object(self.store, "space_available", return_value=False), self.assertRaises(ValueError):
            self.store.retry_failed(self.key)
        path = self.settings.world_content_dir / "worlds/test-prose.json"
        path.write_text("{}", encoding="utf-8")
        with self.assertRaises(ValueError):
            self.store.retry_failed(self.key)
        self.assertEqual(self.store.get(self.key), original)

    def test_cli_retry_requires_stopped_service_and_makes_no_model_calls(self):
        self.fail_early()
        self.assertEqual(self.cli("retry", "--key", self.key)[0], 1)
        self.assertEqual(self.store.get(self.key)["state"], "failed")
        self.service.close()
        self.assertEqual(self.cli("retry", "--key", self.key)[0], 0)
        with_store = Store(self.settings)
        self.addCleanup(with_store.close)
        self.assertEqual(with_store.get(self.key)["state"], "retry_wait")
        self.assertEqual(with_store.get(self.key)["attempts"], 1)
        self.model.assert_not_called()

    def test_cli_repair_restores_exact_prose_without_regeneration(self):
        self.submit()
        self.service.tick()
        path = self.store.publication_path(self.payload)
        original = path.read_bytes()
        path.unlink()
        before = self.store.get(self.key)
        self.service.close()
        self.assertEqual(self.cli("repair", "--key", self.key)[0], 0)
        self.assertEqual(path.read_bytes(), original)
        with_store = Store(self.settings)
        self.addCleanup(with_store.close)
        for field in ("prose", "attempts", "usage", "model", "prompt"):
            self.assertEqual(with_store.get(self.key)[field], before[field])
        self.assertEqual(self.model.call_count, 1)

    def test_quarantine_preserves_prose_accounting_and_blocks_stale_publication(self):
        self.submit()
        self.service.tick()
        before = self.store.get(self.key)
        path = self.store.publication_path(self.payload)
        archive = path.with_name(f".quarantined-{self.key}.json")
        original = path.read_bytes()
        with self.store.connect() as db:
            usage = [tuple(row) for row in db.execute("SELECT * FROM attempt_usage")]
            daily = [tuple(row) for row in db.execute("SELECT * FROM daily_usage")]
        row = self.store.quarantine(self.key)
        self.assertEqual((row["state"], row["published"], row["error"]), ("failed", 0, "content_quarantined"))
        self.assertFalse(path.exists())
        self.assertEqual(archive.read_bytes(), original)
        for field in ("payload", "prose", "attempts", "usage", "model", "prompt", "created", "completed"):
            self.assertEqual(row[field], before[field])
        self.assertEqual(self.store.quarantine(self.key), row)
        self.store.request_repair(before)
        with self.assertRaises(ValueError):
            self.store.publish(before)
        with self.assertRaises(ValueError):
            self.store.retry_failed(self.key)
        self.store.publish_pending()
        self.assertEqual(self.submit()["state"], "failed")
        self.assertFalse(self.service.tick())
        self.assertFalse(path.exists())
        with self.store.connect() as db:
            self.assertEqual([tuple(row) for row in db.execute("SELECT * FROM attempt_usage")], usage)
            self.assertEqual([tuple(row) for row in db.execute("SELECT * FROM daily_usage")], daily)
        self.assertEqual(self.model.call_count, 1)
        self.store.refresh_usage()
        self.assertGreaterEqual(self.store._content_bytes, len(original))

    def test_quarantine_rejects_unknown_and_unfinished_jobs(self):
        with self.assertRaises(ValueError):
            self.store.quarantine("absent")
        self.submit()
        for state in ("queued", "running", "retry_wait", "failed"):
            with self.subTest(state=state):
                with self.store.connect() as db:
                    db.execute("UPDATE room_jobs SET state=? WHERE content_key=?", (state, self.key))
                before = self.store.get(self.key)
                with self.assertRaises(ValueError):
                    self.store.quarantine(self.key)
                self.assertEqual(self.store.get(self.key), before)
        self.model.assert_not_called()

    def test_quarantine_unpublished_prose_never_creates_publication(self):
        self.submit()
        claimed = self.store.claim()
        self.store.complete(claimed, fake_prose(), "fake", "test", {"total_tokens": 17})
        before = self.store.get(self.key)
        row = self.store.quarantine(self.key)
        self.assertEqual(row["prose"], before["prose"])
        self.assertEqual(row["usage"], before["usage"])
        self.assertEqual(row["published"], 0)
        self.assertFalse(self.service.tick())
        self.assertFalse(self.store.publication_path(self.payload).exists())
        self.model.assert_not_called()

    def test_quarantine_rename_failure_can_be_retried_without_repair(self):
        self.submit()
        self.service.tick()
        path = self.store.publication_path(self.payload)
        original = path.read_bytes()
        with patch.object(Path, "rename", side_effect=PermissionError("file occupied")), self.assertRaises(PermissionError):
            self.store.quarantine(self.key)
        row = self.store.get(self.key)
        self.assertEqual((row["state"], row["published"], row["error"]), ("failed", 1, "content_quarantined"))
        self.assertEqual(path.read_bytes(), original)
        self.assertFalse(self.service.tick())
        self.assertEqual(self.store.quarantine(self.key)["published"], 0)
        self.assertFalse(path.exists())
        self.assertEqual(path.with_name(f".quarantined-{self.key}.json").read_bytes(), original)
        self.assertEqual(self.model.call_count, 1)

    def test_quarantine_refuses_archive_collision_and_world_mismatch(self):
        self.submit()
        self.service.tick()
        before = self.store.get(self.key)
        path = self.store.publication_path(self.payload)
        original = path.read_bytes()
        archive = path.with_name(f".quarantined-{self.key}.json")
        archive.write_bytes(b"previous archive")
        with self.assertRaises(ValueError):
            self.store.quarantine(self.key)
        self.assertEqual(archive.read_bytes(), b"previous archive")
        self.assertEqual(path.read_bytes(), original)
        self.assertEqual(self.store.get(self.key), before)
        (self.settings.world_content_dir / "worlds/test-prose.json").write_text("{}", encoding="utf-8")
        with self.assertRaises(ValueError):
            self.store.quarantine(self.key)
        self.assertEqual(self.store.get(self.key), before)

    def test_cli_quarantine_requires_stopped_service_and_survives_backup_restore(self):
        self.submit()
        self.service.tick()
        path = self.store.publication_path(self.payload)
        original = path.read_bytes()
        self.assertEqual(self.cli("quarantine", "--key", self.key)[0], 1)
        self.assertEqual(self.store.get(self.key)["state"], "ready")
        self.assertEqual(path.read_bytes(), original)
        self.service.close()
        self.assertEqual(self.cli("quarantine", "--key", self.key)[0], 0)
        self.assertFalse(path.exists())
        self.assertEqual(self.cli("repair", "--key", self.key)[0], 1)
        self.assertEqual(self.cli("retry", "--key", self.key)[0], 1)
        backup = Path(self.temp.name) / "backup"
        self.assertEqual(self.cli("backup", str(backup))[0], 0)
        self.settings = replace(self.settings, data_dir=Path(self.temp.name) / "restored-ai",
                                world_content_dir=Path(self.temp.name) / "restored-world")
        self.assertEqual(self.cli("restore", str(backup))[0], 0)
        restored = WorldService(self.settings, generator=self.model, start_worker=False)
        self.addCleanup(restored.close)
        row = restored.store.get(self.key)
        self.assertEqual((row["state"], row["published"], row["error"]), ("failed", 0, "content_quarantined"))
        restored_path = restored.store.publication_path(self.payload)
        self.assertFalse(restored_path.exists())
        self.assertEqual(restored_path.with_name(f".quarantined-{self.key}.json").read_bytes(), original)
        response = restored.process_request(dict(type="world_describe", request_id="visit", **self.payload),
                                            time.monotonic() + 3)
        self.assertEqual(response["status"], "failed")
        self.assertFalse(restored.tick())
        self.assertEqual(self.model.call_count, 1)


if __name__ == "__main__":
    unittest.main()
