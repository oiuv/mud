"""Real local filesystem boundary checks; provider access is never involved."""
import os
import subprocess
import sys
import tempfile
import time
import unittest
from dataclasses import replace
from pathlib import Path
from unittest.mock import patch

from ai.src.runtime.context import Policy, RunContext
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.filesystem import SafeRoot
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.runtime.tools import Tools
from ai.src.tools.source import Scope, Sources, build_tools


class SourceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="mud-source-tools-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.authorized = self.root / "public"
        self.authorized.mkdir()
        self.source = self.authorized / "skill.lpc"
        self.source.write_text('int learn() {\n    return contribution >= 100;\n}\n', encoding="utf-8")
        self.outside = self.root / "outside"
        self.outside.mkdir()
        (self.outside / "hidden.lpc").write_text("PRIVATE-OUTSIDE", encoding="utf-8")
        self.scope = Scope("rules", self.authorized, agents={"npc"}, audiences={"player", "admin"}, egress=True)
        self.sources = Sources([self.scope])
        self.tools = Tools(build_tools({"sources": self.sources}))
        self.context = RunContext("source-test", "player", "player", "npc:player", Policy(
            tools={"source.read", "source.search"}, scopes={"rules"}, egress_scopes={"rules"}),
            time.monotonic() + 30, agent_id="npc")

    def read(self, path="skill.lpc", **extra):
        return self.tools.execute("source.read", {"scope": "rules", "path": path, **extra},
                                  self.context, "read-" + str(len(self.context.state.calls)))

    def test_read_line_snapshot_and_changed_file(self):
        first = self.read(start=2, end=2)
        self.assertTrue(first["ok"], first)
        evidence = first["value"]["evidence"][0]
        self.assertEqual(evidence["content"], "    return contribution >= 100;")
        self.assertEqual(evidence["start"], 2)
        self.assertEqual(evidence["end"], 2)
        self.assertEqual(len(evidence["hash"]), 64)
        self.assertTrue(evidence["read_at"])
        self.source.write_text("updated", encoding="utf-8")
        self.assertEqual(self.read(expected_hash=evidence["hash"])["error"], "source_changed")

    def test_default_deny_and_egress_separate_from_local_access(self):
        sources = Sources()
        with self.assertRaises(RuntimeFault):
            sources.read(self.context, {"scope": "rules", "path": "skill.lpc"})
        local = Sources([replace(self.scope, egress=False)])
        tools = Tools(build_tools({"sources": local}))
        args = {"scope": "rules", "path": "skill.lpc"}
        self.assertEqual(tools.execute("source.read", args, self.context, "egress")["error"], "egress_denied")
        context = replace(self.context, external_model=False)
        self.assertTrue(tools.execute("source.read", args, context, "local")["ok"])
        for context in (replace(self.context, agent_id="other"), replace(self.context, audience="internal"),
                        replace(self.context, policy=replace(self.context.policy, scopes=set()))):
            with self.assertRaises(RuntimeFault):
                self.sources.authorize(context, args)

    def test_paths_are_rejected_before_filesystem(self):
        for path in ("../outside/hidden.lpc", "/etc/passwd", "C:/secret.lpc", "\\\\server\\share\\x",
                     "\\\\?\\C:\\x", "skill.lpc:stream", "./skill.lpc", "nested/../skill.lpc",
                     "skill.lpc.", "skill.lpc ", "NUL", "COM1.lpc", "sub//skill.lpc", "x\x00y"):
            with self.subTest(path=path), patch.object(SafeRoot, "read") as read:
                self.assertFalse(self.read(path)["ok"])
                read.assert_not_called()

    def test_private_names_exclusions_and_search_do_not_leak(self):
        for name in (".env", ".git", "data", "logs", "players", "secrets"):
            folder = self.authorized / name
            folder.mkdir()
            (folder / "hidden.lpc").write_text("PRIVATE-NEEDLE", encoding="utf-8")
        (self.authorized / "password.lpc").write_text("PRIVATE-NEEDLE", encoding="utf-8")
        scope = replace(self.scope, exclude=("excluded*",), include=("*.lpc",))
        (self.authorized / "excluded.lpc").write_text("PRIVATE-NEEDLE", encoding="utf-8")
        tools = Tools(build_tools({"sources": Sources([scope])}))
        reply = tools.execute("source.search", {"scope": "rules", "query": "PRIVATE-NEEDLE"}, self.context, "search")
        self.assertTrue(reply["ok"], reply)
        self.assertEqual(reply["value"]["evidence"], [])
        self.assertFalse(reply["value"]["truncated"])
        self.assertNotIn("hidden", str(reply))
        self.assertEqual(self.read("data/hidden.lpc")["error"], self.read("missing.lpc")["error"])

    def test_literal_search_limits_and_oversized_or_binary_files(self):
        self.source.write_text("x.*y\n" * 12, encoding="utf-8")
        reply = self.tools.execute("source.search", {"scope": "rules", "query": ".*", "limit": 2}, self.context, "search")
        self.assertEqual(len(reply["value"]["evidence"]), 2)
        self.assertTrue(reply["value"]["truncated"])
        self.source.write_bytes(b"x" * 262145)
        self.assertEqual(self.read()["error"], "file_too_large")
        self.source.write_bytes(b"x\0y")
        self.assertEqual(self.read()["error"], "file_unavailable")
        self.source.write_text("x\n" * 400, encoding="utf-8")
        self.assertEqual(self.read(start=1, end=300)["error"], "line_range_unavailable")

    def test_hard_link_is_denied_without_content(self):
        os.link(self.outside / "hidden.lpc", self.authorized / "linked.lpc")
        self.assertEqual(self.read("linked.lpc")["error"], "file_unavailable")
        reply = self.tools.execute("source.search", {"scope": "rules", "query": "PRIVATE"}, self.context, "search")
        self.assertNotIn("PRIVATE-OUTSIDE", str(reply))
        self.assertNotIn("linked.lpc", str(reply))

    def test_symbolic_links_are_denied(self):
        try:
            (self.authorized / "linked.lpc").symlink_to(self.outside / "hidden.lpc")
            (self.authorized / "linked_dir").symlink_to(self.outside, target_is_directory=True)
        except OSError as error:
            self.skipTest(f"Cannot create OS symlink fixture: {type(error).__name__}")
        self.assertFalse(self.read("linked.lpc")["ok"])
        self.assertFalse(self.read("linked_dir/hidden.lpc")["ok"])
        reply = self.tools.execute("source.search", {"scope": "rules", "query": "PRIVATE"}, self.context, "search")
        self.assertNotIn("PRIVATE-OUTSIDE", str(reply))

    @unittest.skipUnless(os.name == "nt", "Windows junction/reparse test requires Windows")
    def test_windows_junction_is_denied(self):
        junction = self.authorized / "junction"
        result = subprocess.run(["cmd", "/c", "mklink", "/J", str(junction), str(self.outside)],
                                capture_output=True, timeout=10)
        self.assertEqual(result.returncode, 0, "Junction fixture creation failed")
        self.assertFalse(self.read("junction/hidden.lpc")["ok"])
        reply = self.tools.execute("source.search", {"scope": "rules", "query": "PRIVATE"}, self.context, "search")
        self.assertNotIn("PRIVATE-OUTSIDE", str(reply))

    def test_replace_race_is_blocked_or_detected(self):
        read = os.read
        attempted = []
        def replace_during_read(descriptor, size):
            if not attempted:
                attempted.append(True)
                try:
                    os.replace(self.outside / "hidden.lpc", self.source)
                except PermissionError:
                    attempted.append("blocked")
            return read(descriptor, size)
        with patch("ai.src.runtime.filesystem.os.read", side_effect=replace_during_read):
            reply = self.read()
        self.assertTrue(attempted)
        if "blocked" in attempted:
            self.assertTrue(reply["ok"], reply)
        else:
            self.assertEqual(reply["error"], "source_changed")
        self.assertNotIn("PRIVATE-OUTSIDE", str(reply))

    def test_parent_replace_race_is_blocked_or_detected(self):
        folder = self.authorized / "nested"
        folder.mkdir()
        (folder / "inner.lpc").write_text("SAFE", encoding="utf-8")
        read = os.read
        attempted = []
        def replace_during_read(descriptor, size):
            if not attempted:
                attempted.append(True)
                try:
                    folder.rename(self.authorized / "moved")
                except PermissionError:
                    attempted.append("blocked")
            return read(descriptor, size)
        with patch("ai.src.runtime.filesystem.os.read", side_effect=replace_during_read):
            reply = self.read("nested/inner.lpc")
        self.assertTrue(attempted)
        if "blocked" in attempted:
            self.assertTrue(reply["ok"], reply)
        else:
            self.assertFalse(reply["ok"])

    def test_hook_cannot_swap_authorized_path_or_audience(self):
        hooks = Hooks([Hook("before_tool", lambda event: Decision(changes={"arguments": {
            "scope": "rules", "path": "../outside/hidden.lpc"}}), intervention=True)])
        self.tools.hooks = hooks
        self.assertFalse(self.read()["ok"])
        hooks = Hooks([Hook("before_tool", lambda event: Decision(changes={"audience": "admin"}), intervention=True)])
        self.tools.hooks = hooks
        self.assertEqual(self.read()["error"], "hook_field_denied")

    def test_unsupported_platform_fails_closed(self):
        root = SafeRoot(self.authorized)
        with patch("ai.src.runtime.filesystem.os.name", "unknown"), patch("ai.src.runtime.filesystem.sys.platform", "unknown"):
            with self.assertRaises(RuntimeFault) as caught:
                with root.opened("skill.lpc"):
                    pass
        self.assertEqual(caught.exception.code, "safe_filesystem_unavailable")
