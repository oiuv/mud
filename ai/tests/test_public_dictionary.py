"""Public dictionary and bounded long-line evidence; no private game data."""
import hashlib
import os
import subprocess
import tempfile
import unittest
from dataclasses import replace
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from ai.src.npc.investigation import evidence_reference_feedback, verify_investigation
from ai.src.runtime.context import Policy, RunContext
from ai.src.runtime.filesystem import SafeRoot
from ai.src.runtime.tools import Tools
from ai.src.settings import Settings
from ai.src.source_config import load_sources
from ai.src.tools.source import Scope, Sources, build_tools, public_path


class PublicDictionaryTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix="mud-public-dictionary-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.repository = self.root / "repository"
        (self.repository / "data").mkdir(parents=True)
        self.path = "data/e2c_dict.o"
        self.file = self.repository / self.path
        self.line = 'dict ([' + '"padding":"字",' * 1100 + '"count":"术数","mathematics":"算术",' + '"tail":"末",' * 1100 + '])'
        self.file.write_text("# public names\n" + self.line + "\n", encoding="utf-8")
        self.scope = Scope("repository", self.repository)
        self.sources = Sources((self.scope,))
        self.tools = Tools(build_tools({"sources": self.sources}))
        self.context = RunContext("dictionary", "alice", "player", "alice", Policy(
            tools={"source.read", "source.search"}, scopes={"repository"}, egress_scopes={"repository"}),
            None, agent_id="npc_dialogue")

    def execute(self, name, **arguments):
        return self.tools.execute(name, arguments, self.context, "call-" + str(len(self.context.state.calls)))

    def search(self, query="count", **arguments):
        return self.execute("source.search", query=query, **arguments)

    def read_hit(self, hit):
        return self.execute("source.read", **{key: hit[key] for key in
                            ("path", "start", "end", "start_column", "end_column")}, expected_hash=hit["hash"])

    def test_exact_public_path_only_and_private_siblings_never_opened(self):
        for name in ("data/private.o", "other.o", "other/data/e2c_dict.o", "data/sub/e2c_dict.o",
                     "data/e2c_dict.o.bak", "data/../e2c_dict.o", "data/e2c_dict.o:secret"):
            self.assertFalse(public_path(name), name)
            with patch.object(SafeRoot, "read", side_effect=AssertionError("must not read private files")):
                self.assertFalse(self.execute("source.read", path=name)["ok"], name)
        (self.repository / "data/private.o").write_text("PRIVATE_NEEDLE", encoding="utf-8")
        with patch.object(SafeRoot, "entries", side_effect=AssertionError("must not enumerate data")):
            found = self.search(path_glob="data/*")
            private = self.search("PRIVATE_NEEDLE", path_glob="data/*")
        self.assertTrue(found["ok"], found)
        self.assertEqual(len(found["value"]["evidence"]), 1)
        self.assertEqual(private["value"]["evidence"], [])
        self.assertNotIn("private.o", str(private))

    def test_long_line_search_and_column_read_preserve_verbatim_evidence(self):
        for query in ("count", "术数", "mathematics", "算术"):
            with self.subTest(query=query):
                reply = self.search(query, path_glob=self.path)
                hit = reply["value"]["evidence"][0]
                self.assertTrue(reply["value"]["truncated"])
                self.assertEqual((hit["start"], hit["end"]), (2, 2))
                self.assertEqual(hit["content"], self.line[hit["start_column"] - 1:hit["end_column"]])
                self.assertIn(query, hit["content"])
                self.assertLess(len(hit["content"].encode("utf-8")), 2048)
                self.assertEqual(hit["hash"], hashlib.sha256(self.file.read_bytes()).hexdigest())
                read = self.read_hit(hit)
                self.assertTrue(read["ok"], read)
                evidence = read["value"]["evidence"][0]
                self.assertEqual(evidence["content"], hit["content"])
                self.assertEqual(evidence["origin"], "source.read")
                self.assertTrue(evidence["truncated"])

    def test_broad_search_also_finds_dictionary_without_listing_private_directory(self):
        entries = SafeRoot.entries
        listed = []
        def record(root, path, *args, **kwargs):
            listed.append(path)
            return entries(root, path, *args, **kwargs)
        with patch.object(SafeRoot, "entries", record):
            reply = self.search()
        self.assertEqual([item["path"] for item in reply["value"]["evidence"]], [self.path])
        self.assertNotIn("data", listed)
        self.assertEqual(self.search(path_glob="skills/*")["value"]["evidence"], [])

    def test_column_range_and_size_contracts(self):
        for columns in ({"start_column": 1}, {"end_column": 5}, {"start_column": 4, "end_column": 2},
                        {"start_column": 0, "end_column": 2},
                        {"start_column": 1, "end_column": len(self.line) + 1}):
            self.assertFalse(self.execute("source.read", path=self.path, start=2, end=2, **columns)["ok"])
        self.assertFalse(self.execute("source.read", path=self.path, start=1, end=2,
                                      start_column=1, end_column=4)["ok"])
        self.assertEqual(self.execute("source.read", path=self.path)["error"], "result_too_large")
        # Columns are generic source slicing, not a special save-file parser.
        (self.repository / "long.py").write_text(self.line, encoding="utf-8")
        hit = self.search(path_glob="long.py")["value"]["evidence"][0]
        self.assertTrue(self.read_hit(hit)["ok"])

    def test_column_evidence_rechecks_entire_file_version(self):
        hit = self.search()["value"]["evidence"][0]
        read = self.read_hit(hit)["value"]["evidence"][0]
        candidate = SimpleNamespace(status="incomplete", value={"claims": [{"evidence": [read["id"]]}]})
        self.assertEqual(verify_investigation(candidate, self.context, self.tools), ())
        self.file.write_text("# changed elsewhere\n" + self.line, encoding="utf-8")
        self.assertIn("source_recheck:source_changed", verify_investigation(candidate, self.context, self.tools))

    def test_reference_feedback_does_not_confuse_disjoint_columns(self):
        clue = self.search()["value"]["evidence"][0]
        self.execute("source.read", path=self.path, start=2, end=2, start_column=1, end_column=20)
        feedback = evidence_reference_feedback([clue["id"]], self.context.state.evidence)
        self.assertTrue(feedback[0].startswith("read_required_for_reference:"))
        read = self.read_hit(clue)["value"]["evidence"][0]
        feedback = evidence_reference_feedback([clue["id"]], self.context.state.evidence)
        self.assertEqual(feedback[0], "replace_search_reference:" + clue["id"] + "->" + read["id"])

    def test_actual_private_paths_and_include_exclude_rules_take_precedence(self):
        for index, scope in enumerate((replace(self.scope, exclude=("data/*",)),
                                       replace(self.scope, include=("*.lpc",)),
                                       replace(self.scope, exclude=(self.path.upper(),)))):
            tools = Tools(build_tools({"sources": Sources((scope,))}))
            with patch.object(SafeRoot, "read", side_effect=AssertionError("private")):
                self.assertFalse(tools.execute("source.read", {"path": self.path}, self.context, f"private-{index}")["ok"])
                self.assertEqual(tools.execute("source.search", {"query": "count"}, self.context,
                                               f"search-{index}")["value"]["evidence"], [])
        for private_key in ("data_dir", "world_content_dir", "reasoning_trace_file"):
            settings = Settings(source_root=self.repository)
            setattr(settings, private_key, self.repository / "data" /
                    "thinking.jsonl" if private_key == "reasoning_trace_file" else self.repository / "data")
            self.assertFalse(load_sources(settings).scopes["repository"].accepts(self.path))

    def test_disabled_and_alternative_repository_never_read_original_dictionary(self):
        other = self.root / "other"
        other.mkdir()
        (other / "rule.lpc").write_text("int count = 7;", encoding="utf-8")
        for settings in (Settings(source_root=other), Settings(source_root=other, source_enabled=False)):
            sources = load_sources(settings)
            tools = Tools(build_tools({"sources": sources}))
            # Deployment changes create a new run, not reuse the previous run's tool cache.
            context = RunContext("alternative", "alice", "player", "alice", self.context.policy, None)
            result = tools.execute("source.search", {"query": "count"}, context, "search")
            if settings.source_enabled:
                self.assertEqual([hit["path"] for hit in result["value"]["evidence"]], ["rule.lpc"])
                self.assertFalse(result["value"]["truncated"])
            else:
                self.assertFalse(result["ok"], result)
                self.assertEqual(result["error"], "scope_denied")
            self.assertFalse(tools.execute("source.read", {"path": self.path}, context,
                                          "missing-" + str(settings.source_enabled))["ok"])

    def test_hard_link_at_public_path_is_still_rejected(self):
        self.file.unlink()
        private = self.root / "hidden.o"
        private.write_text("PRIVATE_NEEDLE", encoding="utf-8")
        os.link(private, self.file)
        self.assertFalse(self.execute("source.read", path=self.path)["ok"])
        self.assertEqual(self.search("PRIVATE_NEEDLE")["value"]["evidence"], [])

    def test_symlink_at_public_path_is_still_rejected(self):
        self.file.unlink()
        private = self.root / "hidden.o"
        private.write_text("PRIVATE_NEEDLE", encoding="utf-8")
        try:
            self.file.symlink_to(private)
        except OSError:
            self.skipTest("OS does not permit symlink fixtures")
        self.assertFalse(self.execute("source.read", path=self.path)["ok"])
        self.assertEqual(self.search("PRIVATE_NEEDLE")["value"]["evidence"], [])

    @unittest.skipUnless(os.name == "nt", "Windows junction fixture")
    def test_junction_parent_cannot_expose_private_dictionary(self):
        self.file.unlink()
        self.file.parent.rmdir()
        private = self.root / "outside"
        private.mkdir()
        (private / "e2c_dict.o").write_text("PRIVATE_NEEDLE", encoding="utf-8")
        self.assertEqual(subprocess.run(["cmd", "/c", "mklink", "/J", str(self.file.parent), str(private)],
                                       capture_output=True, timeout=10).returncode, 0)
        self.addCleanup(lambda: os.rmdir(self.file.parent))
        self.assertFalse(self.execute("source.read", path=self.path)["ok"])
        self.assertEqual(self.search("PRIVATE_NEEDLE")["value"]["evidence"], [])
