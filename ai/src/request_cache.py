"""Namespaced success cache in the existing business database, not a task engine."""
import json
import time

from .database import connect
from .protocol import MAX_DATAGRAM
from .runtime.contracts import RuntimeFault, json_text, parse_json


class RequestCache:
    def __init__(self, settings, namespace):
        self.path = settings.data_dir / "conversations.db"
        self.namespace = namespace
        self.ttl, self.size = settings.request_cache_ttl, settings.request_cache_size
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with connect(self.path) as db:
            # Separate composite key keeps every legacy NPC request_id valid.
            db.execute("""CREATE TABLE IF NOT EXISTS capability_results(
                namespace TEXT NOT NULL,request_id TEXT NOT NULL,fingerprint TEXT NOT NULL,
                response TEXT NOT NULL,created REAL NOT NULL,PRIMARY KEY(namespace,request_id))""")

    def get(self, request_id, fingerprint, check):
        check()
        with connect(self.path) as db:
            row = db.execute("SELECT fingerprint,response FROM capability_results "
                             "WHERE namespace=? AND request_id=? AND created>?",
                             (self.namespace, request_id, time.time() - self.ttl)).fetchone()
        check()
        if row is None:
            return None
        if row["fingerprint"] != fingerprint:
            raise RuntimeFault("request_conflict")
        return parse_json(row["response"], MAX_DATAGRAM)

    def put(self, request_id, fingerprint, response, check):
        encoded = json_text(response, MAX_DATAGRAM)
        # Match the actual socket serializer, including its default separators.
        if len(json.dumps(response, ensure_ascii=False).encode("utf-8")) > MAX_DATAGRAM:
            raise RuntimeFault("size_limit", "incomplete")
        if response.get("status") != "completed" or "result_ref" in response:
            raise RuntimeFault("invalid_cached_result")
        with connect(self.path) as db:
            db.execute("BEGIN IMMEDIATE")
            check()
            previous = db.execute("SELECT fingerprint,response FROM capability_results "
                                  "WHERE namespace=? AND request_id=? AND created>?",
                                  (self.namespace, request_id, time.time() - self.ttl)).fetchone()
            if previous:
                if previous["fingerprint"] != fingerprint:
                    raise RuntimeFault("request_conflict")
                return parse_json(previous["response"], MAX_DATAGRAM)
            db.execute("INSERT OR REPLACE INTO capability_results VALUES(?,?,?,?,?)",
                       (self.namespace, request_id, fingerprint, encoded, time.time()))
            db.execute("DELETE FROM capability_results WHERE namespace=? AND created<?",
                       (self.namespace, time.time() - self.ttl))
            db.execute("DELETE FROM capability_results WHERE namespace=? AND request_id IN "
                       "(SELECT request_id FROM capability_results WHERE namespace=? "
                       "ORDER BY created DESC LIMIT -1 OFFSET ?)", (self.namespace, self.namespace, self.size))
            check()
        return response
