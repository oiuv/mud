"""Offline regression suite. All data is temporary; external calls are mocked."""
import json
import os
import socket
import tempfile
import threading
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

import numpy as np

from ai.src.database import connect
from ai.src.npc.history import HistoryManager, LEGACY_SUMMARY
from ai.src.knowledge_basic import BasicKnowledgeSystem
from ai.src.knowledge_qwen import QwenKnowledgeSystem
from ai.src.npc.memory import MemoryStore
from ai.src.npc.manager import NPCManager, Reply, ChatUnavailable
from ai.src.settings import Settings, SERVICE_DIR, load_settings
from ai.src.udp_server import UDPServer
from ai.src.npc.service import NPCService


class Fixture(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="mud-ai-tests-")
        self.root = Path(self.temp.name)
        assert self.root.resolve().parent == Path(tempfile.gettempdir()).resolve()
        self.addCleanup(self.temp.cleanup)
        self.help = self.root / "help"
        self.help.mkdir()
        self.roles = self.root / "roles.json"
        self.roles.write_text(json.dumps({"npc": {"name": "侠客", "memory_capacity": 10}}), encoding="utf-8")
        self.settings = Settings(data_dir=self.root / "data", help_dir=self.help,
                                 roles_file=self.roles, embedding_dimensions=4)

    def corpus(self):
        (self.help / "wudang").write_text("武当派拜师须先找到张三丰。学习太极剑法。", encoding="utf-8")
        (self.help / "shaolin").write_text("少林派武功包括罗汉拳。少林弟子守戒。", encoding="utf-8")
        return BasicKnowledgeSystem(settings=self.settings)

    def embedding_client(self):
        client = Mock()
        client.with_options.return_value = client
        client.embeddings.create.side_effect = lambda **kwargs: SimpleNamespace(
            data=[SimpleNamespace(embedding=[1, 0.2, 0.1, 0.3])])
        return client

    def knowledge(self, **kwargs):
        basic = self.corpus()
        client = self.embedding_client()
        system = QwenKnowledgeSystem(settings=self.settings, basic=basic, client=client, **kwargs)
        return system, client

    def server(self, simulated=False):
        npc = FakeNPC(simulated)
        service = NPCService(self.settings, npc_manager=npc)
        server = UDPServer(settings=self.settings)
        server.register(service.request_types, service.process_request,
                        max_workers=self.settings.max_workers, timeout=self.settings.request_timeout,
                        close=service.close)
        server.npc_service = service
        self.addCleanup(server.stop)
        return server, npc

    @staticmethod
    def request(player="player", request_id="r1", message="武当派如何拜师"):
        return dict(type="chat", npc_id="npc", player_id=player, player_name="少侠",
                    request_id=request_id, message=message, context="客店")


class FakeNPC:
    def __init__(self, simulated=False):
        self.config = {"name": "侠客", "memory_capacity": 10}
        self.calls = []
        self.summary_calls = []
        self.simulated = simulated
        self.fail_summary = False
        self.fail_chat = False

    def get_npc_config(self, npc_id):
        return self.config if npc_id == "npc" else {}

    def summarize(self, previous, history, deadline=None):
        self.summary_calls.append((previous, history))
        if self.fail_summary:
            raise ChatUnavailable("summary unavailable")
        return "玩家先前询问了拜师。"

    def generate_response(self, npc_id, player_name, message, memory, history, context, deadline=None):
        self.calls.append((message, history))
        if self.fail_chat:
            raise ChatUnavailable("model unavailable")
        return Reply("侠客说：请找张三丰。", self.simulated)

    update_player_memory = NPCManager.update_player_memory


class SettingsTests(Fixture):
    def test_defaults_and_dotenv_environment_precedence(self):
        env = self.root / ".env"
        env.write_text("EMBEDDING_MODEL=custom-embedding\nRERANK_MODEL=custom-rerank\nDEBUG=true\n", encoding="utf-8")
        with patch.dict(os.environ, {"RERANK_MODEL": "environment-rerank"}, clear=True):
            settings = load_settings(env)
        self.assertEqual(settings.embedding_model, "custom-embedding")
        self.assertEqual(settings.rerank_model, "environment-rerank")
        self.assertTrue(settings.debug)
        self.assertEqual(settings.chat_model, "qwen3.8-flash")
        self.assertEqual(Settings().chat_model, "qwen3.8-flash")
        self.assertEqual(Settings().embedding_model, "qwen3.7-text-embedding-flash")
        self.assertEqual(Settings().rerank_model, "qwen3.7-text-rerank")

    def test_paths_and_workspace_endpoint(self):
        with patch.dict(os.environ, {"DATA_DIR": "custom-data", "DASHSCOPE_WORKSPACE_ID": "workspace"}, clear=True):
            settings = load_settings(self.root / "missing.env")
        self.assertEqual(settings.data_dir, SERVICE_DIR / "custom-data")
        self.assertIn("workspace.cn-beijing.maas.aliyuncs.com", settings.rerank_url)
        self.assertEqual(settings.chat_base_url,
                         "https://workspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1")

    def test_explicit_chat_configuration_overrides_workspace_defaults(self):
        env = self.root / ".env"
        env.write_text('OPENAI_MODEL=custom-chat\nOPENAI_BASE_URL=https://example.test/v1\n'
                       'CHAT_EXTRA_BODY={}\n', encoding="utf-8")
        with patch.dict(os.environ, {"DASHSCOPE_WORKSPACE_ID": "workspace",
                                     "OPENAI_MODEL": "environment-chat"}, clear=True):
            settings = load_settings(env)
        self.assertEqual(settings.chat_model, "environment-chat")
        self.assertEqual(settings.chat_base_url, "https://example.test/v1")
        self.assertEqual(settings.chat_extra_body, {})

    def test_invalid_settings(self):
        for arguments in ({"chunk_overlap": 3000}, {"max_workers": 0}, {"max_message_chars": 9999}):
            with self.assertRaises(ValueError):
                Settings(**arguments)


class RetrievalTests(Fixture):
    def test_chinese_bm25_question(self):
        basic = self.corpus()
        result = basic.search("请问武当派如何拜师？")
        self.assertEqual(result[0]["filename"], "wudang")
        self.assertGreater(result[0]["bm25_score"], 0)
        self.assertEqual(basic.search("xyznonexistent"), [])

    def test_complete_long_document_is_chunked(self):
        (self.help / "long").write_text("前文" * 3000 + "尾部绝学紫霞神功", encoding="utf-8")
        basic = BasicKnowledgeSystem(settings=replace(self.settings, chunk_size=300, chunk_overlap=20))
        self.assertIn("紫霞", basic.search("紫霞神功")[0]["content"])
        self.assertGreater(basic.get_stats()["total_documents"], 10)

    def test_index_rebuild_removes_deleted_content(self):
        basic = self.corpus()
        (self.help / "wudang").unlink()
        basic.process_files()
        self.assertEqual(basic.search("武当"), [])

    def test_embedding_model_dimensions_and_no_2000_character_cutoff(self):
        (self.help / "long").write_text("武当剑法" * 600, encoding="utf-8")
        client = self.embedding_client()
        system = QwenKnowledgeSystem(settings=self.settings, client=client)
        system.update_vectors()
        call = client.embeddings.create.call_args.kwargs
        self.assertEqual(call["model"], "qwen3.7-text-embedding-flash")
        self.assertEqual(call["dimensions"], 4)
        self.assertGreater(len(call["input"]), 2000)

    def test_vector_model_change_requires_rebuild(self):
        system, client = self.knowledge()
        system.update_vectors()
        other = QwenKnowledgeSystem(settings=self.settings, basic=system.basic, client=client, model_name="other-model")
        self.assertEqual(other.semantic_search("武当"), [])
        self.assertTrue(other.hybrid_search("武当"))

    def test_vector_failure_does_not_poison_cache(self):
        system, client = self.knowledge()
        system.update_vectors()
        client.embeddings.create.side_effect = RuntimeError("offline")
        self.assertTrue(system.hybrid_search("武当拜师"))
        self.assertNotIn("武当拜师", system.vector_cache)
        client.embeddings.create.side_effect = None
        client.embeddings.create.return_value = SimpleNamespace(data=[SimpleNamespace(embedding=[1, 0, 0, 0])])
        self.assertTrue(system.semantic_search("武当拜师", threshold=0))
        self.assertIn("武当拜师", system.vector_cache)

    def test_empty_vector_results_still_use_bm25(self):
        system, _ = self.knowledge()
        self.assertTrue(system.hybrid_search("武当"))
        self.assertEqual(system.hybrid_search("武当", threshold=1), [])

    def test_zero_vector_rejected(self):
        system, client = self.knowledge()
        client.embeddings.create.side_effect = None
        client.embeddings.create.return_value = SimpleNamespace(data=[SimpleNamespace(embedding=[0] * 4)])
        with self.assertRaises(ValueError):
            system._query_vector("question")
        self.assertEqual(len(system.vector_cache), 0)

    def test_embedding_rebuild_failure_keeps_existing_vectors(self):
        system, client = self.knowledge()
        system.update_vectors()
        before = system.get_stats()["indexed_vectors"]
        (self.help / "new").write_text("新武功", encoding="utf-8")
        system.basic.process_files()
        client.embeddings.create.side_effect = RuntimeError("offline")
        with self.assertRaises(RuntimeError):
            system.update_vectors()
        self.assertEqual(system.get_stats()["indexed_vectors"], before)

    def test_cache_lru_and_ttl(self):
        system, client = self.knowledge()
        system.settings.vector_cache_size = 1
        system._query_vector("one")
        system._query_vector("two")
        self.assertNotIn("one", system.vector_cache)
        system._query_vector("two")
        self.assertEqual(system.cache_stats["hits"], 1)
        system.vector_cache["two"] = (time.monotonic() - 99999, np.ones(4))
        system._query_vector("two")
        self.assertEqual(client.embeddings.create.call_count, 3)

    def test_rrf_combines_both_rankings(self):
        system, _ = self.knowledge()
        _, docs = system.basic.corpus()
        with patch.object(system.basic, "search", return_value=[dict(docs[0], bm25_score=4.0), dict(docs[1], bm25_score=2.0)]), \
             patch.object(system, "semantic_search", return_value=[dict(docs[1], vector_score=0.9)]):
            results = system.hybrid_search("query")
        self.assertEqual(results[0]["id"], docs[1]["id"])
        self.assertEqual(set(results[0]["sources"]), {"vector", "bm25"})
        self.assertEqual(results[0]["bm25_score"], 2.0)
        self.assertEqual(results[0]["vector_score"], 0.9)
        self.assertAlmostEqual(results[0]["score"], 1 / 62 + 1 / 61)

    def test_rerank_native_payload_and_original_index_mapping(self):
        system, _ = self.knowledge()
        system.settings.dashscope_api_key = "fake"
        _, docs = system.basic.corpus()
        response = Mock()
        response.json.return_value = {"output": {"results": [{"index": 1, "relevance_score": .9}]}}
        with patch("ai.src.knowledge_qwen.httpx.post", return_value=response) as post:
            ranked = system.rerank("武当", docs, 1)
        self.assertEqual(ranked[0]["id"], docs[1]["id"])
        payload = post.call_args.kwargs["json"]
        self.assertEqual(payload["model"], "qwen3.7-text-rerank")
        self.assertEqual(payload["input"]["query"], "武当")
        self.assertEqual(payload["parameters"]["top_n"], 1)

    def test_rerank_failure_preserves_fused_results(self):
        system, _ = self.knowledge()
        system.settings.dashscope_api_key = "fake"
        with patch("ai.src.knowledge_qwen.httpx.post", side_effect=RuntimeError("offline")):
            self.assertTrue(system.hybrid_search("武当"))

    def test_rerank_invalid_index_falls_back(self):
        system, _ = self.knowledge()
        system.settings.dashscope_api_key = "fake"
        response = Mock()
        response.json.return_value = {"output": {"results": [{"index": 999, "relevance_score": .9}]}}
        with patch("ai.src.knowledge_qwen.httpx.post", return_value=response):
            self.assertTrue(system.hybrid_search("武当"))


class StorageTests(Fixture):
    def test_recent_history_has_stable_id_order(self):
        history = HistoryManager(self.settings.data_dir)
        for index in range(12):
            history.save_conversation("npc", "N", "p", "P", "user", str(index))
        self.assertEqual([row["content"] for row in history.get_conversation_history("npc", "p", 3)],
                         ["9", "10", "11"])
        self.assertEqual(history.get_conversation_history("npc", "p", 0), [])

    def test_legacy_json_migration_is_once_and_preserves_source(self):
        self.settings.data_dir.mkdir()
        path = self.settings.data_dir / "memories.json"
        original = json.dumps({"npc": {"p": {"familiarity": 15}}})
        path.write_text(original, encoding="utf-8")
        store = MemoryStore(self.settings.data_dir)
        store.update_player_memory("npc", "p", "P", {"familiarity": 16})
        again = MemoryStore(self.settings.data_dir)
        self.assertEqual(again.get_player_memory("npc", "p")["familiarity"], 16)
        self.assertEqual(path.read_text(encoding="utf-8"), original)

    def test_corrupt_legacy_json_is_not_overwritten(self):
        self.settings.data_dir.mkdir()
        path = self.settings.data_dir / "memories.json"
        path.write_text("{broken", encoding="utf-8")
        with self.assertRaises(ValueError):
            MemoryStore(self.settings.data_dir)
        self.assertEqual(path.read_text(encoding="utf-8"), "{broken")

    def test_legacy_summary_is_retained(self):
        history = HistoryManager(self.settings.data_dir)
        history.save_conversation("npc", "N", "p", "P", "user", LEGACY_SUMMARY, LEGACY_SUMMARY)
        history.save_conversation("npc", "N", "p", "P", "assistant", "旧摘要")
        self.assertEqual(history.get_summary("npc", "p")["content"], "旧摘要")
        history.clear_history("npc", "p")
        self.assertEqual(history.get_summary("npc", "p")["through_id"], 0)

    def test_many_players_persist_concurrently(self):
        server, npc = self.server()
        with ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda i: server.process_request(self.request(str(i), str(i))), range(25)))
        self.assertTrue(all(result["type"] == "chat" for result in results))
        self.assertEqual(len(server.npc_service.memory.get_npc_players("npc")), 25)


class ChatTests(Fixture):
    def test_chat_and_summary_send_qwen_model_and_non_thinking_parameters(self):
        client = Mock()
        client.with_options.return_value = client
        client.chat.completions.create.side_effect = [SimpleNamespace(choices=[SimpleNamespace(
            finish_reason="stop", message=SimpleNamespace(content=text))]) for text in (
                json.dumps(dict(status="completed", kind="conversation", answer="侠客说：少侠有礼。",
                                claims=[], pending=[]), ensure_ascii=False), "玩家向侠客问好。")]
        knowledge = Mock()
        knowledge.hybrid_search.return_value = []
        manager = NPCManager(settings=self.settings, client=client, knowledge=knowledge)
        manager.generate_response("npc", "P", "你好", {}, [], "房间")
        manager.summarize("", [{"role": "user", "content": "你好"}])
        calls = client.chat.completions.create.call_args_list
        self.assertEqual(len(calls), 2)
        for call in calls:
            self.assertEqual(call.kwargs["model"], "qwen3.8-flash")
            self.assertEqual(call.kwargs["extra_body"], {"enable_thinking": False})
        self.assertEqual(calls[0].kwargs["max_tokens"], 2048)
        self.assertEqual(calls[1].kwargs["max_tokens"], 1200)

    def test_summary_keeps_current_question_and_original_input(self):
        server, npc = self.server()
        for index in range(6):
            response = server.process_request(self.request(request_id=str(index), message=f"问题{index}"))
            self.assertEqual(response["type"], "chat")
        self.assertEqual(len(npc.summary_calls), 1)
        self.assertEqual(npc.calls[-1][0], "问题5")
        self.assertEqual(server.npc_service.history.get_conversation_history("npc", "player", 2)[0]["content"], "问题5")
        self.assertGreater(server.npc_service.history.get_summary("npc", "player")["through_id"], 0)

    def test_summary_failure_still_answers_current_question(self):
        server, npc = self.server()
        npc.fail_summary = True
        for index in range(6):
            result = server.process_request(self.request(request_id=str(index)))
        self.assertEqual(result["type"], "chat")
        self.assertEqual(server.npc_service.history.get_summary("npc", "player")["through_id"], 0)

    def test_capacity_zero_omits_context_but_keeps_archive(self):
        server, npc = self.server()
        npc.config["memory_capacity"] = 0
        server.process_request(self.request())
        server.process_request(self.request(request_id="r2"))
        self.assertEqual(npc.calls[-1][1], [])
        self.assertEqual(len(server.npc_service.history.get_conversation_history("npc", "player")), 4)

    def test_failed_model_does_not_save_or_grow_relationship(self):
        server, npc = self.server()
        npc.fail_chat = True
        result = server.process_request(self.request())
        self.assertEqual(result["code"], "model_unavailable")
        self.assertEqual(result["request_id"], "r1")
        self.assertEqual(server.npc_service.memory.get_player_memory("npc", "player"), {})
        self.assertEqual(server.npc_service.history.get_conversation_history("npc", "player"), [])

    def test_simulated_reply_does_not_pollute_memory(self):
        server, _ = self.server(simulated=True)
        result = server.process_request(self.request())
        self.assertTrue(result["simulated"])
        self.assertEqual(server.npc_service.history.get_conversation_history("npc", "player"), [])

    def test_duplicate_concurrent_requests_run_once(self):
        server, npc = self.server()
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(lambda _: server.process_request(self.request()), range(4)))
        self.assertTrue(all(result == results[0] for result in results))
        self.assertEqual(len(npc.calls), 1)
        self.assertEqual(server.npc_service.memory.get_player_memory("npc", "player")["total_interactions"], 1)

    def test_completed_request_deduplicated_after_restart(self):
        server, _ = self.server()
        first = server.process_request(self.request())
        restarted, npc = self.server()
        self.assertEqual(restarted.process_request(self.request()), first)
        self.assertEqual(npc.calls, [])

    def test_request_id_conflict_is_rejected(self):
        server, _ = self.server()
        server.process_request(self.request())
        self.assertEqual(server.process_request(self.request(message="another"))["type"], "error")

    def test_invalid_requests_and_expired_deadline(self):
        server, _ = self.server()
        for request in ([], {}, self.request(message="x" * 1001), self.request(message="")):
            self.assertEqual(server.process_request(request)["type"], "error")
        result = server.process_request(self.request(), started=time.monotonic() - 999)
        self.assertEqual(result["type"], "error")
        self.assertEqual(server.npc_service.history.get_conversation_history("npc", "player"), [])

    def test_chat_sdk_failure_becomes_typed_error(self):
        client = Mock()
        client.with_options.return_value = client
        client.chat.completions.create.side_effect = RuntimeError("secret internal detail")
        knowledge = Mock()
        knowledge.hybrid_search.return_value = []
        manager = NPCManager(settings=self.settings, client=client, knowledge=knowledge)
        with self.assertRaises(ChatUnavailable) as error:
            manager.generate_response("npc", "P", "问题", {}, [], "房间")
        self.assertNotIn("secret", str(error.exception))

    def test_missing_role_fields_receive_defaults(self):
        manager = NPCManager(settings=self.settings, knowledge=Mock())
        self.assertEqual(manager.get_npc_config("npc")["speech_style"], "古雅自然")
        self.assertTrue(manager.generate_response("npc", "P", "你好", {}, [], "房间").simulated)

    def test_relationship_rounding_at_threshold(self):
        npc = FakeNPC()
        result = npc.update_player_memory("npc", "p", "P", "msg", "reply", {"familiarity": 4.9})
        self.assertEqual(result["relationship"], "相识")

    def test_udp_smoke_and_stop(self):
        server, _ = self.server()
        server.port = 0
        thread = threading.Thread(target=server.start, daemon=True)
        thread.start()
        try:
            deadline = time.monotonic() + 5
            while not server.running and time.monotonic() < deadline:
                time.sleep(.01)
            self.assertTrue(server.running)
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as client:
                client.settimeout(5)
                address = ("127.0.0.1", server.port)
                client.sendto(json.dumps(self.request()).encode(), address)
                data, _ = client.recvfrom(65535)
                response = json.loads(data)
                self.assertEqual(response["type"], "chat")
                self.assertEqual(response["request_id"], "r1")
                client.sendto(b"{invalid", address)
                data, _ = client.recvfrom(65535)
                self.assertEqual(json.loads(data)["code"], "invalid_request")
        finally:
            server.stop()
            thread.join(5)
        self.assertFalse(thread.is_alive())



class EdgeCaseTests(Fixture):
    def test_deep_json_packet_does_not_kill_udp_listener(self):
        server, _ = self.server()
        server.port = 0
        failures = []
        invalid_packet = "[" * 1100 + "]" * 1100
        original_loads = json.loads

        def decode(packet):
            # Python 3.10 raises here; 3.14 accepts deeper JSON. Cover both runtimes.
            if packet == invalid_packet:
                raise RecursionError("JSON nesting exceeds decoder limit")
            return original_loads(packet)

        def serve():
            try:
                server.start()
            except Exception as error:
                failures.append(error)

        thread = threading.Thread(target=serve, daemon=True)
        with patch("ai.src.udp_server.json.loads", side_effect=decode):
            thread.start()
            try:
                deadline = time.monotonic() + 3
                while not server.running and time.monotonic() < deadline:
                    time.sleep(0.01)
                self.assertTrue(server.running)
                with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as client:
                    client.settimeout(2)
                    address = ("127.0.0.1", server.port)
                    client.sendto(invalid_packet.encode("utf-8"), address)
                    data, _ = client.recvfrom(65535)
                    self.assertEqual(json.loads(data)["code"], "invalid_request")
                    client.sendto(json.dumps(self.request()).encode("utf-8"), address)
                    data, _ = client.recvfrom(65535)
                    self.assertEqual(json.loads(data)["type"], "chat")
                    self.assertTrue(thread.is_alive())
            finally:
                server.stop()
                thread.join(3)
        self.assertEqual(failures, [])

    def test_truncated_completion_is_not_a_valid_summary(self):
        client = Mock()
        client.with_options.return_value = client
        client.chat.completions.create.return_value = SimpleNamespace(choices=[SimpleNamespace(
            finish_reason="length", message=SimpleNamespace(content="incomplete summary"))])
        manager = NPCManager(settings=self.settings, client=client, knowledge=Mock())
        with self.assertRaises(ChatUnavailable):
            manager.summarize("old summary", [{"role": "user", "content": "question"}])

    def test_conflicting_ids_cannot_commit_across_concurrent_sessions(self):
        server, npc = self.server()
        players = ["first"]
        for index in range(100):
            other = str(index)
            if hash(("npc", other)) % 64 != hash(("npc", "first")) % 64:
                players.append(other)
                break
        gate = threading.Barrier(2)
        original = npc.generate_response
        def respond(*args, **kwargs):
            gate.wait(timeout=5)
            return original(*args, **kwargs)
        npc.generate_response = respond
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(lambda player: server.process_request(self.request(player)), players))
        self.assertEqual(sorted(result["type"] for result in results), ["chat", "error"])
        self.assertEqual(len(server.npc_service.memory.get_npc_players("npc")), 1)

    def test_same_session_concurrent_distinct_requests_keep_relationship(self):
        server, npc = self.server()
        npc.config["memory_capacity"] = 0
        with ThreadPoolExecutor(max_workers=6) as pool:
            results = list(pool.map(lambda i: server.process_request(self.request(request_id=str(i))), range(20)))
        self.assertTrue(all(result["type"] == "chat" for result in results))
        self.assertEqual(server.npc_service.memory.get_player_memory("npc", "player")["total_interactions"], 20)
        self.assertEqual(len(server.npc_service.history.get_conversation_history("npc", "player", 100)), 40)

    def test_rerank_request_respects_total_byte_budget(self):
        system, _ = self.knowledge()
        system.settings.dashscope_api_key = "fake"
        _, documents = system.basic.corpus()
        query = "question"
        first_length = len((documents[0]["title"] + "\n" + documents[0]["content"]).encode("utf-8"))
        system.settings.rerank_total_bytes = first_length + len(query.encode("utf-8"))
        response = Mock()
        response.json.return_value = {"output": {"results": [{"index": 0, "relevance_score": .9}]}}
        with patch("ai.src.knowledge_qwen.httpx.post", return_value=response) as post:
            system.rerank(query, documents, 2)
        self.assertEqual(len(post.call_args.kwargs["json"]["input"]["documents"]), 1)

    def test_expired_deadline_skips_model(self):
        server, npc = self.server()
        result = server.process_request(self.request(), started=time.monotonic() - 999)
        self.assertEqual(result["code"], "timeout")
        self.assertEqual(npc.calls, [])

    def test_config_rejects_unhashable_optional_player_id(self):
        server, _ = self.server()
        result = server.process_request(dict(type="config", request_id="config", npc_id="npc", player_id=[]))
        self.assertEqual(result["code"], "invalid_request")

    def test_history_budget_triggers_summary_before_message_capacity(self):
        history = HistoryManager(self.settings.data_dir)
        for index in range(4):
            history.save_conversation("npc", "N", "p", "P", "user" if index % 2 == 0 else "assistant", "x" * 100)
        summary, batch = history.summary_batch("npc", "p", capacity=100, max_chars=250)
        self.assertEqual(len(batch), 2)
        self.assertEqual(batch[-1]["role"], "assistant")


if __name__ == "__main__":
    unittest.main()
