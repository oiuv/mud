#!/usr/bin/env python3
"""Offline status/repair/backup; model calls require explicit --live and test IDs."""
import argparse
import json
import shutil
import sqlite3
import sys
import time
from dataclasses import replace
from contextlib import closing
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from ai.src.settings import load_settings
from ai.src.world.protocol import validate_payload
from ai.src.world.service import WorldService
from ai.src.world.store import Store


def backup(store, destination):
    destination = Path(destination).resolve()
    if destination.exists() or destination.is_relative_to(store.root):
        raise ValueError("Backup destination must be new and outside the world directory")
    destination.mkdir(parents=True)
    with store.connect() as source, closing(sqlite3.connect(destination / "world_content.db")) as target:
        source.backup(target)
    # The store process lock excludes a live world worker. Stop game-side world
    # initialization as well before taking this administrative snapshot.
    for name in ("worlds", "content"):
        source = store.root / name
        if source.exists():
            if any(path.is_symlink() for path in source.rglob("*")):
                raise ValueError("Refuse symlinks in backup")
            shutil.copytree(source, destination / name)
    (destination / "complete.json").write_text('{"format":1}\n', encoding="utf-8")


def restore(settings, source):
    source = Path(source).resolve()
    if json.loads((source / "complete.json").read_text(encoding="utf-8")) != {"format": 1}:
        raise ValueError("Incomplete backup")
    root = settings.world_content_dir.resolve()
    database = settings.data_dir.resolve() / "world_content.db"
    if root.is_relative_to(source) or source.is_relative_to(root) or database.is_relative_to(source):
        raise ValueError("Restore targets must be outside the backup tree")
    if root.exists() or database.exists() or any(Path(str(database) + suffix).exists() for suffix in ("-wal", "-shm", "-journal", ".lock")):
        raise ValueError("Restore only into an absent world directory and absent database/sidecars")
    if not (source / "worlds").is_dir() or any(path.is_symlink() for path in source.rglob("*")):
        raise ValueError("Invalid backup tree")
    with closing(sqlite3.connect((source / "world_content.db").as_uri() + "?mode=ro", uri=True)) as db:
        if db.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise ValueError("Backup database failed integrity check")
    root.mkdir(parents=True)
    database.parent.mkdir(parents=True, exist_ok=True)
    for name in ("worlds", "content"):
        if (source / name).exists():
            shutil.copytree(source / name, root / name)
    # Publish the database last. A partial restore cannot silently enable jobs.
    shutil.copyfile(source / "world_content.db", database)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    status = sub.add_parser("status")
    status.add_argument("--key")
    repair = sub.add_parser("repair")
    repair.add_argument("--key", required=True)
    save = sub.add_parser("backup")
    save.add_argument("destination", type=Path)
    recover = sub.add_parser("restore")
    recover.add_argument("source", type=Path)
    describe = sub.add_parser("describe")
    describe.add_argument("payload_file", type=Path, help="one LPC-exported payload, or a list of 1–30 payloads")
    describe.add_argument("--live", action="store_true", help="allow paid calls; service must be stopped")
    describe.add_argument("--max-calls", type=int, default=1)
    args = parser.parse_args(argv)
    settings = load_settings()
    store = service = None
    try:
        if args.command == "status":
            path = (settings.data_dir / "world_content.db").resolve()
            with closing(sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)) as db:
                db.row_factory = sqlite3.Row
                if args.key:
                    rows = db.execute("SELECT content_key,world_id,state,attempts,error,published,model,prompt,usage "
                                      "FROM room_jobs WHERE content_key=?", (args.key,))
                else:
                    rows = db.execute("SELECT state,count(*) AS jobs,sum(attempts) AS attempts FROM room_jobs GROUP BY state")
                print(json.dumps([dict(row) for row in rows], ensure_ascii=False, indent=2))
                print("UTC usage:", json.dumps([dict(row) for row in db.execute(
                    "SELECT day,calls FROM daily_usage ORDER BY day DESC LIMIT 7")]))
            return 0
        if args.command == "restore":
            restore(settings, args.source)
            print("Restored; generation remains controlled by configuration and game switch.")
            return 0
        if args.command == "describe":
            if not 1 <= args.max_calls <= 30 or args.payload_file.stat().st_size > 30 * 6144:
                raise ValueError("Limit must be 1..30 calls; payload file <=180 KiB")
            payloads = json.loads(args.payload_file.read_text(encoding="utf-8"))
            payloads = payloads if isinstance(payloads, list) else [payloads]
            if not 1 <= len(payloads) <= 30:
                raise ValueError("Provide 1..30 room payloads")
            for payload in payloads:
                validate_payload(payload)
                if not payload["world_id"].startswith("test-"):
                    raise ValueError("Live diagnostic accepts test worlds only")
            if not args.live:
                print(f"Validated {len(payloads)} rooms; no writes or model calls. Use --live explicitly to generate.")
                return 0
            service = WorldService(replace(settings, world_enabled=True), start_worker=False)
            if service.store is None:
                raise ValueError("Store/model unavailable or service is running")
            keys = {payload["content_key"] for payload in payloads}
            for payload in payloads:
                service.process_request(dict(type="world_describe", request_id="cli", **payload), time.monotonic() + 3)
            for _ in range(args.max_calls):
                if not service.tick(keys):
                    break
            for key in sorted(keys):
                row = service.store.get(key)
                print(key, row["state"] if row else "not accepted", row["attempts"] if row else 0)
            return 0
        store = Store(settings)
        if args.command == "backup":
            backup(store, args.destination)
        elif args.command == "repair":
            row = store.get(args.key)
            if not row or row["state"] != "ready":
                raise ValueError("Repair only accepts a durably completed job; it never generates text")
            store.publish(row)
        return 0
    except (OSError, ValueError, sqlite3.Error) as error:
        print(f"World operation failed: {type(error).__name__}: {error}", file=sys.stderr)
        return 1
    finally:
        if service:
            service.close()
        if store:
            store.close()


if __name__ == "__main__":
    raise SystemExit(main())
