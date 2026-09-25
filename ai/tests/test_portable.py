"""Standalone assembly and legacy replay; no provider or real game data."""
import json
import os
import shutil
import subprocess
import sys
import textwrap
from dataclasses import replace
from pathlib import Path
from unittest.mock import patch

from ai import main
from ai.src.settings import SERVICE_DIR, Settings, load_settings
from ai.tests.test_npc_ai import Fixture


class PortableTests(Fixture):
    def test_legacy_omitted_type_and_persistent_replay(self):
        request = json.loads((Path(__file__).parent / "fixtures/legacy_chat.json").read_text(encoding="utf-8"))
        first, model = self.server()
        response = first.process_request(request)
        self.assertEqual(response["type"], "chat")
        self.assertEqual(response["request_id"], request["request_id"])
        self.assertEqual(len(model.calls), 1)
        first.stop()
        second, new_model = self.server()
        self.assertEqual(second.process_request(request), response)
        self.assertEqual(new_model.calls, [])
        self.assertEqual(len(second.npc_service.history.get_conversation_history("npc", "player")), 2)
        self.assertEqual(second.npc_service.memory.get_player_memory("npc", "player")["total_interactions"], 1)

    def test_explicit_module_selection_and_cleanup(self):
        settings = replace(self.settings, enabled_modules=())
        with patch("ai.src.npc.service.NPCService") as npc, patch("ai.src.world.service.WorldService") as world:
            server = main.create_server(settings)
            self.addCleanup(server.stop)
            server.register("fixture", lambda request, deadline: {"answer": "ok"}, max_workers=1, timeout=1)
            self.assertEqual(server.process_request({"type": "fixture"})["answer"], "ok")
            npc.assert_not_called()
            world.assert_not_called()
            self.assertFalse(settings.data_dir.exists())
        with patch("ai.src.world.service.WorldService") as world:
            server = main.create_server(replace(self.settings, enabled_modules=("npc",)))
            self.addCleanup(server.stop)
            self.assertEqual(set(server._routes), {"chat", "memory", "config"})
            world.assert_not_called()

    def test_paths_module_validation_and_environment_precedence(self):
        env_file = self.root / "portable.env"
        env_file.write_text("ENABLED_MODULES=world\nKNOWLEDGE_UPDATE_ENABLED=false\nHELP_DIR=docs\n"
                            "DATA_DIR=state\nNPC_ROLES_FILE=roles.json\nSKILLS_DIR=guidance\n", encoding="utf-8")
        with patch.dict(os.environ, {"ENABLED_MODULES": "npc"}, clear=True):
            settings = load_settings(env_file)
        self.assertEqual(settings.enabled_modules, ("npc",))
        self.assertFalse(settings.knowledge_update_enabled)
        self.assertEqual(settings.help_dir, SERVICE_DIR / "docs")
        self.assertEqual(settings.data_dir, SERVICE_DIR / "state")
        self.assertEqual(settings.roles_file, SERVICE_DIR / "roles.json")
        self.assertEqual(settings.skills_dir, SERVICE_DIR / "guidance")
        self.assertEqual(replace(settings, help_dir=self.help).help_dir, self.help)
        for invalid in (("npc", "npc"), ("third-party-import",), "npc", (None,)):
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                Settings(enabled_modules=invalid)

    def test_empty_assembly_does_not_import_business_modules(self):
        completed = subprocess.run([sys.executable, "-c", textwrap.dedent("""
            import sys
            from ai.main import create_server
            from ai.src.settings import Settings
            server = create_server(Settings(enabled_modules=()))
            assert not any(name.startswith(('ai.src.npc', 'ai.src.world')) for name in sys.modules)
            server.stop()
        """)], cwd=SERVICE_DIR.parent, capture_output=True, timeout=15)
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_standalone_copy_alternative_roles_and_socket_chat(self):
        deployment = self.root / "standalone"
        deployment.mkdir()
        shutil.copy2(SERVICE_DIR / "main.py", deployment / "main.py")
        shutil.copytree(SERVICE_DIR / "src", deployment / "src", ignore=shutil.ignore_patterns("__pycache__"))
        external = self.root / "another-game"
        external.mkdir()
        (external / "guide").mkdir()
        (external / "guide/rules").write_text("星港通行须向领航员领取通行证。", encoding="utf-8")
        (external / "roles.json").write_text(json.dumps({"navigator": {
            "name": "领航员", "title": "星港向导", "role": "导航员", "memory_capacity": 10,
            "knowledge_threshold": 1, "greeting": "欢迎来到星港。",
        }}, ensure_ascii=False), encoding="utf-8")
        environment = {key: value for key, value in os.environ.items()
                       if key in ("PATH", "SYSTEMROOT", "TEMP", "TMP", "WINDIR", "COMSPEC")}
        environment.update(ENABLED_MODULES="npc", KNOWLEDGE_UPDATE_ENABLED="false",
                           DATA_DIR=str(external / "state"), HELP_DIR=str(external / "guide"),
                           NPC_ROLES_FILE=str(external / "roles.json"), OPENAI_API_KEY="fake-test-key",
                           OPENAI_BASE_URL="http://invalid.test/v1", DASHSCOPE_API_KEY="")
        code = textwrap.dedent("""
            import json, socket, sys, threading, time
            from pathlib import Path
            from types import SimpleNamespace
            from unittest.mock import Mock, patch
            sys.path.insert(0, sys.argv[1])
            from main import create_server
            from src.settings import load_settings
            client = Mock()
            client.with_options.return_value = client
            client.chat.completions.create.return_value = SimpleNamespace(choices=[SimpleNamespace(
                finish_reason='stop', message=SimpleNamespace(content='领航员说：通行证就在星港领取。'))])
            with patch('src.npc.manager.create_chat_client', return_value=client):
                server = create_server(load_settings())
            assert not any(name.startswith('src.world') for name in sys.modules)
            server.port = 0
            thread = threading.Thread(target=server.start)
            thread.start()
            try:
                until = time.monotonic() + 5
                while not server.running and time.monotonic() < until:
                    time.sleep(.01)
                assert server.running
                with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as peer:
                    peer.settimeout(5)
                    for index in range(6):
                        request = dict(type='chat', request_id=str(index), npc_id='navigator',
                            player_id='visitor', player_name='旅人', message='如何领取通行证', context='星港')
                        peer.sendto(json.dumps(request).encode(), ('127.0.0.1', server.port))
                        response = json.loads(peer.recv(8192))
                        assert response['type'] == 'chat', response
                        assert response['request_id'] == str(index), response
                        assert '领航员' in response['response'], response
                assert client.chat.completions.create.call_count == 7  # six chats plus one summary
            finally:
                server.stop()
                thread.join(5)
            assert not thread.is_alive()
        """)
        completed = subprocess.run([sys.executable, "-c", code, str(deployment)], cwd=self.root,
                                   env=environment, capture_output=True, timeout=25)
        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertFalse((deployment / "data").exists())
        self.assertFalse((self.root / "data/illusion_world").exists())
        self.assertTrue((external / "state/conversations.db").exists())

    def test_disabled_startup_update_does_not_require_help_directory(self):
        environment = dict(os.environ, ENABLED_MODULES="", KNOWLEDGE_UPDATE_ENABLED="false",
                           DATA_DIR=str(self.root / "unused"), HELP_DIR=str(self.root / "absent"),
                           OPENAI_API_KEY="", DASHSCOPE_API_KEY="")
        completed = subprocess.run([sys.executable, str(SERVICE_DIR / "scripts/update_knowledge.py")],
                                   cwd=self.root, env=environment, capture_output=True, timeout=15)
        self.assertEqual(completed.returncode, 0, completed.stderr)
        self.assertFalse((self.root / "unused").exists())
