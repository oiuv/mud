"""Keep the real pinned-release migration rehearsal in the offline test gate."""
import unittest

from ai.scripts.verify_upgrade import BASELINE, run


class UpgradeTests(unittest.TestCase):
    def test_pinned_release_round_trip_and_source_policy_change(self):
        report = run()
        self.assertTrue(report["passed"])
        self.assertEqual(report["baseline"], BASELINE)
        self.assertTrue(report["prior_snapshots_unchanged"])
        self.assertEqual(report["external_model_calls"], 0)
        phases = {phase["phase"]: phase for phase in report["phases"]}
        self.assertEqual(list(phases), ["seed", "source_policy_change", "upgrade", "rollback", "reupgrade"])
        policy_change = phases["source_policy_change"]
        self.assertTrue(policy_change["source_enabled"])
        self.assertTrue(policy_change["business_snapshot_unchanged"])
        self.assertEqual(policy_change["legacy_cache_rejections"], 1)
        self.assertEqual(policy_change["fake_chat_calls"], 0)
        self.assertEqual(policy_change["fake_world_calls"], 0)
        self.assertTrue(phases["upgrade"]["cancelled_without_commit"])
        for name in ("seed", "upgrade", "rollback", "reupgrade"):
            self.assertFalse(phases[name]["source_enabled"])
            self.assertEqual(phases[name]["interrupted_attempts"], 1)
        final = phases["reupgrade"]
        self.assertEqual(final["replayed_chats"], 3)
        self.assertEqual(final["interactions"], 3)
        self.assertEqual(final["ready_rooms"], 2)
        self.assertEqual(final["fake_chat_calls"], 0)
        self.assertEqual(final["fake_world_calls"], 0)


if __name__ == "__main__":
    unittest.main()
