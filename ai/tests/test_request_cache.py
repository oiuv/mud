"""Success namespaces preserve legacy records and roll back on cancellation."""
from ai.src.database import connect
from ai.src.request_cache import RequestCache
from ai.src.runtime.contracts import RuntimeFault
from ai.tests.test_npc_ai import Fixture


class RequestCacheTests(Fixture):
    def test_namespace_isolation_and_legacy_cache_preservation(self):
        first, second = RequestCache(self.settings, "agent_run"), RequestCache(self.settings, "another")
        with connect(first.path) as db:
            db.execute("CREATE TABLE request_results(request_id TEXT PRIMARY KEY,fingerprint TEXT,response TEXT,created REAL)")
            db.execute("INSERT INTO request_results VALUES('same','legacy','old response',0)")
        one = {"status": "completed", "answer": "one"}
        two = {"status": "completed", "answer": "two"}
        first.put("same", "fingerprint", one, lambda: None)
        second.put("same", "fingerprint", two, lambda: None)
        self.assertEqual(first.get("same", "fingerprint", lambda: None), one)
        self.assertEqual(second.get("same", "fingerprint", lambda: None), two)
        with connect(first.path) as db:
            self.assertEqual(db.execute("SELECT response FROM request_results").fetchone()[0], "old response")

    def test_cancel_before_commit_rolls_back_and_does_not_cache_pending_or_references(self):
        cache = RequestCache(self.settings, "agent_run")
        calls = []
        def cancel():
            calls.append(1)
            if len(calls) == 2:
                raise RuntimeFault("cancelled", "cancelled")
        with self.assertRaisesRegex(RuntimeFault, "cancelled"):
            cache.put("id", "fp", {"status": "completed", "answer": "done"}, cancel)
        self.assertIsNone(cache.get("id", "fp", lambda: None))
        for value in ({"status": "pending"}, {"status": "completed", "result_ref": "result:any"},
                      {"status": "completed", "answer": "大" * 10000}):
            with self.assertRaises(RuntimeFault):
                cache.put("id", "fp", value, lambda: None)
        self.assertIsNone(cache.get("id", "fp", lambda: None))
