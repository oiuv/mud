"""Short SQLite transactions; serialize local access to avoid writer/checkpoint races."""
import sqlite3
import threading
from contextlib import contextmanager
from pathlib import Path

# Bounded locks shared by every store using the same database path.
_DATABASE_LOCKS = [threading.RLock() for _ in range(64)]


@contextmanager
def connect(path):
    database_path = str(Path(path).resolve())
    with _DATABASE_LOCKS[hash(database_path) % len(_DATABASE_LOCKS)]:
        connection = sqlite3.connect(database_path, timeout=10)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA busy_timeout = 10000")
        try:
            with connection:
                yield connection
        finally:
            connection.close()


def initialize(path):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with connect(path) as db:
        db.execute("PRAGMA journal_mode = WAL")
