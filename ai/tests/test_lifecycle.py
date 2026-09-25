"""Owned resources and directory migration, entirely inside temporary fixtures."""
import hashlib
import subprocess
import sys
from dataclasses import replace
from pathlib import Path
from unittest.mock import Mock, patch

from ai import main
from ai.src.npc.manager import NPCManager
from ai.src.npc.service import NPCService
from ai.src.knowledge_qwen import QwenKnowledgeSystem
from ai.src.udp_server import UDPServer
from ai.tests.test_npc_ai import Fixture, FakeNPC


class ResourceTests(Fixture):
    def test_owned_clients_close_once_and_injected_clients_stay_open(self):
        client, knowledge = Mock(), Mock()
        with patch("ai.src.npc.manager.create_chat_client", return_value=client), \
                patch("ai.src.npc.manager.QwenKnowledgeSystem", return_value=knowledge):
            manager = NPCManager(settings=self.settings)
        manager.close()
        manager.close()
        client.close.assert_called_once()
        knowledge.close.assert_called_once()
        client.reset_mock()
        knowledge.reset_mock()
        manager = NPCManager(settings=self.settings, client=client, knowledge=knowledge)
        manager.close()
        client.close.assert_not_called()
        knowledge.close.assert_not_called()

    def test_partial_creation_and_close_failure_release_knowledge(self):
        knowledge, client = Mock(), Mock()
        with patch("ai.src.npc.manager.QwenKnowledgeSystem", return_value=knowledge), \
                patch("ai.src.npc.manager.create_chat_client", side_effect=ValueError("bad")):
            with self.assertRaises(ValueError):
                NPCManager(settings=self.settings)
        knowledge.close.assert_called_once()
        knowledge.reset_mock()
        with patch("ai.src.npc.manager.QwenKnowledgeSystem", return_value=knowledge), \
                patch("ai.src.npc.manager.create_chat_client", return_value=client):
            manager = NPCManager(settings=self.settings)
        client.close.side_effect = RuntimeError("close failed")
        with self.assertRaises(RuntimeError):
            manager.close()
        knowledge.close.assert_called_once()
        manager.close()

    def test_factory_registers_isolated_world_and_npc_and_closes_on_failure(self):
        with patch("ai.src.npc.service.NPCService") as factory:
            npc = factory.return_value
            npc.request_types = ("chat", "memory", "config")
            server = main.create_server(self.settings)
            self.assertEqual(set(server._routes), set(npc.request_types) | {"world_describe", "world_status"})
            self.assertIsNot(server._routes["chat"], server._routes["world_describe"])
            self.assertEqual(server._routes["world_describe"].timeout, self.settings.world_short_timeout)
            server.stop()
            npc.close.assert_called_once()
        with patch("ai.src.npc.service.NPCService") as factory, patch.object(main, "UDPServer") as factory_udp:
            factory_udp.return_value.register.side_effect = ValueError("registration")
            with self.assertRaises(ValueError):
                main.create_server(self.settings)
            factory.return_value.close.assert_called_once()
            factory_udp.return_value.stop.assert_called_once()

    def test_embedding_client_ownership(self):
        borrowed = Mock()
        system = QwenKnowledgeSystem(settings=self.settings, client=borrowed)
        system.close()
        borrowed.close.assert_not_called()
        with patch("ai.src.knowledge_qwen.OpenAI") as factory:
            system = QwenKnowledgeSystem(settings=replace(self.settings, dashscope_api_key="test"))
            system._client()
            system.close()
            system.close()
            factory.return_value.close.assert_called_once()


class MigrationTests(Fixture):
    def test_directory_move_keeps_config_indexes_history_memory_and_dedup(self):
        server, _ = self.server()
        response = server.process_request(self.request())
        knowledge, _ = self.knowledge()
        knowledge.update_vectors()
        before_stats = knowledge.get_stats()
        knowledge.close()
        server.stop()

        old = self.root / "deployment" / "npc_ai"
        old.mkdir(parents=True)
        # Both paths were created by this test inside its TemporaryDirectory.
        self.settings.data_dir.rename(old / "data")
        self.roles.rename(old / "roles.json")
        (old / ".env").write_text("OPENAI_MODEL=fixture-model\n", encoding="utf-8")
        snapshot = {str(path.relative_to(old)): hashlib.sha256(path.read_bytes()).hexdigest()
                    for path in old.rglob("*") if path.is_file()}
        current = old.with_name("ai")
        old.rename(current)
        self.assertEqual(snapshot, {str(path.relative_to(current)): hashlib.sha256(path.read_bytes()).hexdigest()
                                   for path in current.rglob("*") if path.is_file()})
        settings = replace(self.settings, data_dir=current / "data", roles_file=current / "roles.json")
        npc = FakeNPC()
        service = NPCService(settings, npc_manager=npc)
        resumed = UDPServer(settings=settings)
        resumed.register(service.request_types, service.process_request, max_workers=1, timeout=5, close=service.close)
        self.addCleanup(resumed.stop)
        self.assertEqual(resumed.process_request(self.request()), response)
        self.assertEqual(npc.calls, [])
        self.assertEqual(len(service.history.get_conversation_history("npc", "player")), 2)
        self.assertEqual(service.memory.get_player_memory("npc", "player")["total_interactions"], 1)
        index = QwenKnowledgeSystem(settings=settings, client=Mock())
        self.addCleanup(index.close)
        self.assertEqual(index.get_stats()["indexed_vectors"], before_stats["indexed_vectors"])
        self.assertTrue(index.basic.search("武当"))
        self.assertEqual((current / ".env").read_text(encoding="utf-8"), "OPENAI_MODEL=fixture-model\n")

    def test_cli_entrypoints_from_another_directory(self):
        root = Path(__file__).resolve().parents[2]
        for script in ("main.py", "scripts/test_retrieval.py", "scripts/diagnose_chat.py"):
            completed = subprocess.run([sys.executable, str(root / "ai" / script), "--help"],
                                       cwd=self.root, capture_output=True, timeout=10)
            self.assertEqual(completed.returncode, 0, completed.stderr)
        completed = subprocess.run([sys.executable, "-m", "ai.main", "--help"], cwd=root,
                                   capture_output=True, timeout=10)
        self.assertEqual(completed.returncode, 0, completed.stderr)
