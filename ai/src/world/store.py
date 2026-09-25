"""Durable unique jobs; short transactions, SQLite first, atomic JSON second."""
import json
import os
import shutil
import sqlite3
import tempfile
import threading
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from .protocol import manifest_digest, strict_json, validate_payload, validate_prose


class Store:
    def __init__(self, settings):
        self.settings = settings
        self.root = settings.world_content_dir.resolve()
        if not (self.root / "worlds").is_dir():
            raise ValueError("World manifest directory is missing")
        content_dir = self.root / "content"
        self.inside_root(content_dir)
        content_dir.mkdir(exist_ok=True)
        # Check publication permissions before enabling any paid work.
        with tempfile.TemporaryFile(dir=content_dir) as probe:
            probe.write(b"world-write-check")
            probe.flush()
            os.fsync(probe.fileno())
        settings.data_dir.mkdir(parents=True, exist_ok=True)
        self.path = settings.data_dir / "world_content.db"
        self.lock = threading.RLock()
        self._process_lock = open(str(self.path) + ".lock", "a+b")
        try:
            # Keep one service/worker owner even across processes and expired leases.
            if os.name == "nt":
                import msvcrt
                if self._process_lock.seek(0, 2) == 0:
                    self._process_lock.write(b"0")
                    self._process_lock.flush()
                self._process_lock.seek(0)
                msvcrt.locking(self._process_lock.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(self._process_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            with self.connect() as db:
                db.execute("PRAGMA journal_mode=WAL")
                db.executescript("""
                    CREATE TABLE IF NOT EXISTS worlds(world_id TEXT PRIMARY KEY, digest TEXT NOT NULL);
                    CREATE TABLE IF NOT EXISTS room_jobs(
                        content_key TEXT PRIMARY KEY, world_id TEXT NOT NULL, payload TEXT NOT NULL,
                        state TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
                        next_at REAL NOT NULL DEFAULT 0, lease REAL NOT NULL DEFAULT 0,
                        error TEXT NOT NULL DEFAULT '', prose TEXT, model TEXT, prompt TEXT, usage TEXT,
                        published INTEGER NOT NULL DEFAULT 0, created REAL NOT NULL, completed REAL);
                    CREATE INDEX IF NOT EXISTS job_work ON room_jobs(state,next_at);
                    CREATE INDEX IF NOT EXISTS job_publish ON room_jobs(state,published,next_at);
                    CREATE TABLE IF NOT EXISTS daily_usage(day TEXT PRIMARY KEY, calls INTEGER NOT NULL);
                    CREATE TABLE IF NOT EXISTS attempt_usage(content_key TEXT NOT NULL, attempt INTEGER NOT NULL,
                        usage TEXT NOT NULL, PRIMARY KEY(content_key,attempt));
                """)
                # The exclusive process lock proves any former owner has ended. Never overlap live calls.
                self.recover_running(db)
            self._usage_at = 0.0
            self._content_bytes = 0
        except BaseException:
            self._process_lock.close()
            raise

    @contextmanager
    def connect(self):
        if not self.lock.acquire(timeout=0.5):
            raise TimeoutError("world store busy")
        try:
            db = sqlite3.connect(self.path, timeout=0.5)
            db.row_factory = sqlite3.Row
            try:
                with db:
                    yield db
            finally:
                db.close()
        finally:
            self.lock.release()

    def close(self):
        self._process_lock.close()

    @staticmethod
    def recover_running(db):
        db.execute("UPDATE room_jobs SET state=CASE WHEN attempts>=3 THEN 'failed' ELSE 'retry_wait' END, "
                   "next_at=MAX(lease,?), error='interrupted' WHERE state='running'", (time.time(),))

    def verify_world(self, payload):
        path = self.root / "worlds" / (payload["world_id"] + ".json")
        self.inside_root(path)
        if not 0 < path.stat().st_size <= 8192:
            raise ValueError("manifest size")
        world = strict_json(path.read_text(encoding="utf-8"))
        if world["world_id"] != payload["world_id"] or manifest_digest(world) != payload["manifest_digest"]:
            raise ValueError("frozen world mismatch")

    def inside_root(self, path):
        if not path.resolve().is_relative_to(self.root):
            raise ValueError("world path escaped root")

    def publication_path(self, payload):
        path = (self.root / "content" / payload["world_id"] /
                f"{payload['x'] // 16}_{payload['y'] // 16}" / f"{payload['x']}_{payload['y']}.json")
        self.inside_root(path)
        return path

    def refresh_usage(self):
        # Background-only scan, streaming filenames; never in a short request or game look.
        total = 0
        for directory, dirs, files in os.walk(self.root / "content", followlinks=False):
            dirs[:] = [name for name in dirs if not (Path(directory) / name).is_symlink()]
            for name in files:
                info = (Path(directory) / name).stat()
                total += max(info.st_size, getattr(info, "st_blocks", 0) * 512, 4096)
        self._content_bytes = total
        self._usage_at = time.monotonic()

    def space_available(self):
        database_bytes = sum(path.stat().st_size for path in
                             (self.path, Path(str(self.path) + "-wal"), Path(str(self.path) + "-shm")) if path.exists())
        reserve = self.settings.world_queue_limit * 16384
        return (database_bytes + self._content_bytes + reserve < self.settings.world_storage_bytes
                and min(shutil.disk_usage(self.root).free, shutil.disk_usage(self.path.parent).free)
                > self.settings.world_disk_headroom + reserve)

    def get(self, key):
        with self.connect() as db:
            row = db.execute("SELECT * FROM room_jobs WHERE content_key=?", (key,)).fetchone()
            return dict(row) if row else None

    def submit(self, payload, deadline):
        validate_payload(payload)
        self.verify_world(payload)
        encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        now = time.time()
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            if time.monotonic() >= deadline:
                raise TimeoutError()
            row = db.execute("SELECT * FROM room_jobs WHERE content_key=?", (payload["content_key"],)).fetchone()
            if row:
                if row["payload"] != encoded:
                    raise ValueError("same content key with different facts")
                return dict(row)
            world = db.execute("SELECT digest FROM worlds WHERE world_id=?", (payload["world_id"],)).fetchone()
            if world and world[0] != payload["manifest_digest"]:
                raise ValueError("world digest conflict")
            count = db.execute("SELECT COUNT(*) FROM room_jobs WHERE state IN ('queued','running','retry_wait')").fetchone()[0]
            day = datetime.fromtimestamp(now, timezone.utc).date().isoformat()
            usage = db.execute("SELECT calls FROM daily_usage WHERE day=?", (day,)).fetchone()
            if count >= self.settings.world_queue_limit or (usage and usage[0] >= self.settings.world_daily_limit) or not self.space_available():
                return None
            db.execute("INSERT OR IGNORE INTO worlds VALUES (?,?)", (payload["world_id"], payload["manifest_digest"]))
            db.execute("INSERT INTO room_jobs(content_key,world_id,payload,state,created) VALUES (?,?,?,'queued',?)",
                       (payload["content_key"], payload["world_id"], encoded, now))
        return self.get(payload["content_key"])

    def claim(self, now=None, allowed_keys=None):
        now = time.time() if now is None else now
        if not self.space_available():
            return None
        day = datetime.fromtimestamp(now, timezone.utc).date().isoformat()
        restriction, args = "", [now]
        if allowed_keys is not None:
            if not allowed_keys or len(allowed_keys) > 30:
                return None
            restriction = " AND content_key IN (" + ",".join("?" for _ in allowed_keys) + ")"
            args += list(allowed_keys)
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            # Sole worker: no live model call here. Recover bookkeeping that failed
            # during an earlier disk outage, without overlapping a running call.
            self.recover_running(db)
            row = db.execute("SELECT * FROM room_jobs WHERE state IN ('queued','retry_wait') AND next_at<=? "
                             "AND attempts<3" + restriction + " ORDER BY next_at,created LIMIT 1", args).fetchone()
            if row is None:
                return None
            db.execute("INSERT OR IGNORE INTO daily_usage VALUES (?,0)", (day,))
            if db.execute("SELECT calls FROM daily_usage WHERE day=?", (day,)).fetchone()[0] >= self.settings.world_daily_limit:
                return None
            db.execute("UPDATE daily_usage SET calls=calls+1 WHERE day=?", (day,))
            db.execute("UPDATE room_jobs SET state='running',attempts=attempts+1,lease=? WHERE content_key=?",
                       (now + self.settings.world_lease, row["content_key"]))
        return self.get(row["content_key"])

    def fail(self, key, code, delay=0, now=None, usage=None):
        now = time.time() if now is None else now
        with self.connect() as db:
            row = db.execute("SELECT attempts FROM room_jobs WHERE content_key=? AND state='running'", (key,)).fetchone()
            if row:
                db.execute("INSERT OR REPLACE INTO attempt_usage VALUES (?,?,?)", (key, row[0], json.dumps(usage or {})))
                state = "failed" if row[0] >= 3 else "retry_wait"
                backoff = 60 if row[0] == 1 else 300
                db.execute("UPDATE room_jobs SET state=?,error=?,next_at=?,lease=0 WHERE content_key=?",
                           (state, code, now + max(delay, backoff), key))

    def complete(self, row, prose, model, prompt, usage=None, *, check=None):
        payload = json.loads(row["payload"])
        prose = validate_prose(prose, payload["facts"])
        self.verify_world(payload)
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            if check is not None:
                check()
            current = db.execute("SELECT * FROM room_jobs WHERE content_key=?", (row["content_key"],)).fetchone()
            if (current is None or current["state"] != "running" or current["attempts"] != row["attempts"]
                    or current["payload"] != row["payload"] or current["lease"] != row["lease"]
                    or current["lease"] <= time.time()):
                raise ValueError("stale world attempt")
            db.execute("INSERT OR REPLACE INTO attempt_usage VALUES (?,?,?)",
                       (row["content_key"], row["attempts"], json.dumps(usage or {})))
            db.execute("UPDATE room_jobs SET state='ready',prose=?,model=?,prompt=?,usage=?,completed=?,lease=0,next_at=0,error='' "
                       "WHERE content_key=? AND state='running'", (json.dumps(prose, ensure_ascii=False), model, prompt,
                                                                json.dumps(usage or {}), time.time(), row["content_key"]))

    def snapshot(self, row):
        payload = validate_payload(json.loads(row["payload"]))
        prose = validate_prose(json.loads(row["prose"]), payload["facts"])
        return {key: value for key, value in payload.items() if key != "facts"} | prose

    def needs_repair(self, row):
        path = self.publication_path(json.loads(row["payload"]))
        try:
            if not 0 < path.stat().st_size <= 4096:
                return True
            return strict_json(path.read_text(encoding="utf-8")) != self.snapshot(row)
        except (OSError, ValueError, UnicodeError, RecursionError):
            return True

    def request_repair(self, row):
        if row["state"] == "ready" and self.needs_repair(row):
            with self.connect() as db:
                # A repeated visit must not reset an existing publication backoff.
                db.execute("UPDATE room_jobs SET published=0,next_at=0 WHERE content_key=? AND published=1",
                           (row["content_key"],))

    def publish(self, row):
        payload = json.loads(row["payload"])
        self.verify_world(payload)
        path = self.publication_path(payload)
        body = json.dumps(self.snapshot(row), ensure_ascii=False, separators=(",", ":")) + "\n"
        if len(body.encode("utf-8")) > 4096:
            raise ValueError("snapshot size")
        path.parent.mkdir(parents=True, exist_ok=True)
        self.inside_root(path)
        previous_bytes = max(path.stat().st_size, 4096) if path.exists() else 0
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", newline="\n", dir=path.parent,
                                             prefix=".publish-", suffix=".tmp", delete=False) as file:
                temporary = file.name
                file.write(body)
                file.flush()
                os.fsync(file.fileno())
            os.replace(temporary, path)
        finally:
            if temporary and os.path.exists(temporary):
                os.unlink(temporary)
        with self.connect() as db:
            db.execute("UPDATE room_jobs SET published=1,error='',next_at=0 WHERE content_key=?", (row["content_key"],))
        self._content_bytes += max(len(body.encode("utf-8")), 4096) - previous_bytes

    def publish_pending(self):
        with self.connect() as db:
            rows = [dict(row) for row in db.execute("SELECT * FROM room_jobs WHERE state='ready' AND published=0 "
                                                   "AND next_at<=? LIMIT 8", (time.time(),))]
        for row in rows:
            try:
                self.publish(row)
            except (OSError, ValueError, sqlite3.Error):
                with self.connect() as db:
                    db.execute("UPDATE room_jobs SET error='publication_failed',next_at=? WHERE content_key=?",
                               (time.time() + 60, row["content_key"]))
