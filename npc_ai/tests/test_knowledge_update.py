"""Incremental startup synchronization and resumable remote work (all APIs mocked)."""
from dataclasses import replace
from pathlib import Path
import socket
import threading
import time
from unittest.mock import patch

from npc_ai.src.database import connect
from npc_ai.src.knowledge_basic import BasicKnowledgeSystem
from npc_ai.src.knowledge_qwen import QwenKnowledgeSystem
from npc_ai.src.knowledge_update import update_knowledge
from npc_ai.tests.test_npc_ai import Fixture


class KnowledgeUpdateTests(Fixture):
    def test_unchanged_corpus_keeps_revision_and_reuses_vectors(self):
        system, client = self.knowledge()
        settings = replace(self.settings, dashscope_api_key="test-key")
        before = system.basic.corpus()[0]
        with patch("npc_ai.src.knowledge_update.QwenKnowledgeSystem", return_value=system):
            self.assertEqual(update_knowledge(settings)["vectors"], "ready")
            self.assertFalse(update_knowledge(settings)["changed"])
        self.assertEqual(client.embeddings.create.call_count, 2)
        self.assertEqual(system.basic.corpus()[0], before)

    def test_changed_added_and_removed_files_sync_both_indexes(self):
        system, client = self.knowledge()
        system.update_vectors()
        (self.help / "wudang").write_text("武当派已经搬迁到新的山门。", encoding="utf-8")
        (self.help / "shaolin").unlink()
        (self.help / "newbie").write_text("新手指南：学习基础剑法。", encoding="utf-8")
        system.process_files()
        self.assertEqual(client.embeddings.create.call_count, 4)
        self.assertEqual(system.basic.search("少林派"), [])
        self.assertIn("新的山门", system.basic.search("武当派")[0]["content"])
        self.assertEqual(system.get_stats()["indexed_vectors"], 2)
        for path in self.help.iterdir():
            path.unlink()
        system.process_files()
        self.assertEqual(system.get_stats()["indexed_vectors"], 0)
        self.assertEqual(system.basic.get_stats()["total_documents"], 0)
        self.assertEqual(client.embeddings.create.call_count, 4)

    def test_partial_failure_preserves_completed_vectors_and_retries_only_missing(self):
        system, client = self.knowledge()
        result = client.embeddings.create.side_effect(input="test")
        client.embeddings.create.side_effect = [result, RuntimeError("offline")]
        settings = replace(self.settings, dashscope_api_key="test-key")
        with patch("npc_ai.src.knowledge_update.QwenKnowledgeSystem", return_value=system):
            with self.assertLogs(level="WARNING"):
                self.assertEqual(update_knowledge(settings)["vectors"], "unavailable")
            self.assertEqual(system.get_stats()["indexed_vectors"], 1)
            client.embeddings.create.side_effect = [result]
            self.assertEqual(update_knowledge(settings)["vectors"], "ready")
        self.assertEqual(client.embeddings.create.call_count, 3)
        self.assertEqual(system.get_stats()["indexed_vectors"], 2)

    def test_new_model_gets_new_vectors_without_overwriting_old_model(self):
        system, client = self.knowledge()
        system.update_vectors()
        other = QwenKnowledgeSystem(settings=self.settings, basic=system.basic,
                                    client=client, model_name="new-embedding-model")
        other.update_vectors()
        other.update_vectors()
        self.assertEqual(client.embeddings.create.call_count, 4)
        self.assertEqual(system.get_stats()["indexed_vectors"], 2)
        self.assertEqual(other.get_stats()["indexed_vectors"], 2)

    def test_no_key_updates_bm25_without_constructing_remote_client(self):
        (self.help / "test").write_text("测试知识库更新", encoding="utf-8")
        with patch("npc_ai.src.knowledge_update.QwenKnowledgeSystem") as remote:
            stats = update_knowledge(self.settings)
        remote.assert_not_called()
        self.assertTrue(stats["changed"])
        self.assertEqual(stats["vectors"], "skipped")
        self.assertEqual(stats["total_documents"], 1)

    def test_missing_source_is_fatal_and_keeps_previous_corpus(self):
        basic = self.corpus()
        before = basic.corpus()
        with self.assertRaises(FileNotFoundError):
            update_knowledge(replace(self.settings, help_dir=self.root / "missing"))
        self.assertEqual(basic.corpus(), before)

    def test_chunk_configuration_changes_are_detected(self):
        self.corpus()
        basic = BasicKnowledgeSystem(settings=replace(self.settings, chunk_size=8, chunk_overlap=2),
                                     auto_build=False)
        before = basic.corpus()[0]
        basic.process_files()
        self.assertGreater(basic.corpus()[0], before)
        self.assertGreater(basic.get_stats()["total_documents"], 2)

    def test_stop_file_allows_udp_server_to_finish_workers(self):
        server, _ = self.server()
        server.port = 0
        stop_file = self.root / "stop.request"
        worker_started = threading.Event()
        worker_finished = threading.Event()

        def slow_response(request, started=None):
            worker_started.set()
            time.sleep(0.15)
            worker_finished.set()
            return {"type": "config"}

        server.process_request = slow_response
        thread = threading.Thread(target=server.start, kwargs={"stop_file": stop_file})
        thread.start()
        try:
            deadline = time.monotonic() + 3
            while not server.running and time.monotonic() < deadline:
                time.sleep(0.01)
            self.assertTrue(server.running)
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as client:
                client.sendto(b'{"type":"config"}', ("127.0.0.1", server.port))
                self.assertTrue(worker_started.wait(2))
                stop_file.touch()
                thread.join(3)
                self.assertFalse(thread.is_alive())
                self.assertTrue(worker_finished.is_set())
                self.assertIsNone(server.server_socket)
        finally:
            stop_file.touch()
            thread.join(3)
