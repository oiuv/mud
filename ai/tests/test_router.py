"""Default-off coordinator: optional delegation, truthful completion and delivery."""
import json
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from unittest.mock import Mock, patch

from ai.main import create_server
from ai.scripts.example_socket import request as socket_request
from ai.src.agents.router import RouterService
from ai.src.database import connect
from ai.src.llm import ModelResponse
from ai.src.npc.manager import NPCManager
from ai.src.npc.service import NPCService
from ai.src.request_lifetime import RequestLifetime
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.world.service import WorldService
from ai.tests.test_npc_ai import Fixture
from ai.tests.test_npc_runtime import completion, reply
from ai.tests.test_runtime import ScriptedModel, tool_call
from ai.tests.test_world import sample_manifest, sample_payload, fake_prose


def result(status="completed", *, answer="少侠有礼。", evidence=None, parts=None, **changes):
    value = json.loads(reply(status, answer=answer, evidence=evidence, parts=parts))
    value.update(changes)
    return ModelResponse(json.dumps(value, ensure_ascii=False))


def delegate(message, call_id="one"):
    return tool_call(call_id, "agent__invoke", json.dumps({"name": "npc_dialogue", "input": {"message": message}}))


def original(messages, **kwargs):
    completed = next(json.loads(item["content"])["value"] for item in reversed(messages)
                     if item["role"] == "tool" and json.loads(item["content"]).get("ok")
                     and "result_ref" in json.loads(item["content"]).get("value", {}))
    return result(answer="", result_ref=completed["result_ref"])


class RouterTests(Fixture):
    def setup_service(self, model, *, with_npc=False, world=None, hooks=None):
        knowledge, _ = self.knowledge()
        self.addCleanup(knowledge.close)
        self.npc = None
        if with_npc:
            self.client = Mock()
            self.client.with_options.return_value = self.client
            self.client.chat.completions.create.return_value = completion(reply())
            manager = NPCManager(settings=self.settings, knowledge=knowledge, client=self.client)
            self.npc = NPCService(self.settings, npc_manager=manager)
            self.addCleanup(self.npc.close)
        self.service = RouterService(self.settings, npc=self.npc, world=world, model=model,
                                     knowledge=knowledge, hooks=hooks)
        self.addCleanup(self.service.close)
        self.contexts = []
        create = self.service.context
        def capture(*args):
            context = create(*args)
            self.contexts.append(context)
            return context
        self.service.context = capture

    def ask(self, **changes):
        request = dict(type="agent_run", request_id="root", player_id="player", goal="你好")
        if self.npc is not None:
            request["npc_id"] = "npc"
        request.update(changes)
        return self.service.process_request(request, None)

    def test_simple_task_uses_one_model_and_zero_delegation(self):
        model = ScriptedModel(result())
        self.setup_service(model)
        response = self.ask()
        self.assertEqual(response["status"], "completed", response)
        self.assertEqual(response["answer"], "少侠有礼。")
        self.assertEqual(len(model.inputs), 1)
        self.assertEqual(self.contexts[0].budget.counts["delegations"], 0)
        self.assertEqual(self.contexts[0].budget.counts["model_calls"], 1)

    def test_direct_tool_use_does_not_force_delegation(self):
        def answer(messages, **kwargs):
            record = json.loads(messages[-1]["content"])["value"]["evidence"][0]
            return result(kind="rules", answer="武当拜师须先寻张三丰。", evidence=[record["id"]])
        model = ScriptedModel(tool_call(name="knowledge__search", arguments='{"query":"武当拜师","threshold":0}'), answer)
        self.setup_service(model)
        self.assertEqual(self.ask(goal="如何拜入武当？")["status"], "completed")
        self.assertEqual(self.contexts[0].budget.counts["delegations"], 0)
        self.assertEqual(len(model.inputs), 2)

    def test_direct_qualified_inference_preserves_goal_status_and_evidence(self):
        public = self.root / "public"
        public.mkdir()
        (public / "entry.lpc").write_text(
            'int allowed(object who) { return who->query_skill("force") >= 100; }', encoding="utf-8")
        self.settings.source_root = public
        cases = [
            ("completed", "门槛是多少？", [], "师父或许盼弟子先稳固根基；这是我的揣测。"),
            ("incomplete", "我的两门修为如何合算？", ["合算定义未查明"],
             "我推测可能兼看两门修为，但合算之法未查明，尚不能作准。"),
            ("needs_input", "我的修为现在够吗？", ["玩家当前修为未知"],
             "若已到一百，这一项便够；只是条件假设，你目前有多少修为？"),
        ]
        for status, goal, pending, inference in cases:
            with self.subTest(status=status):
                def answer(messages, **kwargs):
                    record = json.loads(messages[-1]["content"])["value"]["evidence"][0]
                    return result(status, kind="rules", pending=pending,
                        parts=[{"text": "此处要求内功修为至少一百。", "evidence": [record["id"]]},
                               {"text": inference}],
                        investigation={"subject": goal, "phase": "other", "entry": [record["id"]]})
                model = ScriptedModel(
                    tool_call("guide", "skill", '{"name":"source-investigation"}'),
                    tool_call("entry", "source__read", '{"path":"entry.lpc"}'), answer)
                self.setup_service(model)
                response = self.ask(request_id=status, goal=goal)
                self.assertEqual(response["status"], status, response)
                self.assertIn(inference, response["answer"])
                self.assertEqual(self.contexts[0].budget.counts["delegations"], 0)
                self.assertEqual(len(model.inputs), 3)
                self.assertNotIn("source:", response["answer"])
                if status == "completed":
                    self.assertEqual(self.ask(request_id=status, goal=goal), response)
                    self.assertEqual(len(model.inputs), 3)

    def test_default_main_can_investigate_cross_directory_without_delegation(self):
        for name, content in {"teachers/entry.lpc": '#include "../include/gate.h"\nint learn() { return GATE; }',
                              "include/gate.h": '#define GATE 200\n// UNREQUESTED-LINES',
                              "other/unused.lpc": 'UNREQUESTED-FILE'}.items():
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")

        def answer(messages, **kwargs):
            records = {record["path"]: record["id"] for message in messages if message["role"] == "tool"
                       for record in json.loads(message["content"]).get("value", {}).get("evidence", [])}
            return result(kind="rules", answer="入门须有二百点贡献。", evidence=list(records.values()),
                investigation={"subject": "入门", "phase": "learn", "entry": [records["teachers/entry.lpc"]]})

        for with_npc in (False, True):
            with self.subTest(with_npc=with_npc):
                model = ScriptedModel(
                    tool_call("guide", "skill", '{"name":"source-investigation"}'),
                    tool_call("entry", "source__read", '{"path":"teachers/entry.lpc"}'),
                    tool_call("gate", "source__read", '{"path":"include/gate.h","end":1}'), answer)
                self.setup_service(model, with_npc=with_npc)
                response = self.ask(goal="入门须有多少贡献？", request_id=f"source-{with_npc}")
                self.assertEqual(response["status"], "completed", response)
                self.assertEqual(response["answer"], "入门须有二百点贡献。")
                self.assertEqual(self.contexts[0].budget.counts["delegations"], 0)
                self.assertEqual(len(model.inputs), 4)
                source_hint = next(item["content"] for item in model.inputs[0]
                                   if item["role"] == "system" and item["content"].startswith("源码工具使用"))
                self.assertIn("source-investigation", source_hint)
                self.assertIn("investigation 字段", source_hint)
                self.assertTrue(any("较早模型轮次取得的证据仍可复用" in item.get("content", "")
                                    for item in model.inputs[0] if item["role"] == "system"))
                messages = json.dumps(model.inputs, ensure_ascii=False)
                self.assertIn("#define GATE 200", messages)
                self.assertNotIn("UNREQUESTED-LINES", messages)
                self.assertNotIn("UNREQUESTED-FILE", messages)
                self.assertNotIn("entry.lpc", json.dumps(response))
                self.assertLessEqual(len(self.contexts[0].policy.version), 128)

    def test_disabled_source_preserves_main_document_answer(self):
        self.settings.source_enabled = False
        self.test_direct_tool_use_does_not_force_delegation()
        self.assertNotIn("source.read", self.contexts[0].policy.tools)
        self.assertNotIn("repository", self.contexts[0].policy.scopes)

    def test_main_uses_public_name_columns_with_same_source_boundary(self):
        self.settings.source_root = self.root / "public"
        dictionary = self.settings.source_root / "data/e2c_dict.o"
        dictionary.parent.mkdir(parents=True)
        dictionary.write_text('# names\ndict ([' + '"pad":"字",' * 1500 +
                              '"sword":"基本剑法",])\n', encoding="utf-8")
        def read_name(messages, **kwargs):
            hit = json.loads(messages[-1]["content"])["value"]["evidence"][0]
            return tool_call("read-name", "source__read", json.dumps({key: hit[key] for key in
                             ("path", "start", "end", "start_column", "end_column")}))
        def answer(messages, **kwargs):
            evidence = json.loads(messages[-1]["content"])["value"]["evidence"][0]
            self.assertIn('"sword":"基本剑法"', evidence["content"])
            return result(kind="rules", answer="你问的是基本剑法。", evidence=[evidence["id"]],
                          investigation={"subject": "武功名称", "phase": "other", "entry": [evidence["id"]]})
        model = ScriptedModel(tool_call("guide", "skill", '{"name":"source-investigation"}'),
                              tool_call("find-name", "source__search", json.dumps(
                                  {"query": "sword", "path_glob": "data/e2c_dict.o"})), read_name, answer)
        self.setup_service(model)
        response = self.ask(goal="sword 是哪门武功？")
        self.assertEqual(response["status"], "completed", response)
        self.assertEqual(response["answer"], "你问的是基本剑法。")
        self.assertEqual(self.contexts[0].budget.counts["delegations"], 0)
        self.assertNotIn("data/e2c_dict.o", json.dumps(response))

    def test_main_uses_unified_exec_without_delegation(self):
        self.settings.codegraph_enabled = True
        self.settings.codegraph_operations = ("query",)
        (self.root / ".codegraph").mkdir()
        (self.root / ".codegraph/codegraph.db").write_bytes(b"fake index")
        (self.root / "entry.lpc").write_text("int learn() { return 200; }\n", encoding="utf-8")
        def answer(messages, **kwargs):
            names = [tool["function"]["name"] for tool in kwargs["tools"]]
            self.assertEqual(names.count("exec"), 1)
            self.assertNotIn("codegraph__explore", names)
            ref = json.loads(messages[-1]["content"])["value"]["evidence"][0]["id"]
            return result(kind="rules", answer="入门须有二百点贡献。", evidence=[ref],
                          investigation={"subject": "入门", "phase": "learn", "entry": [ref]})
        model = ScriptedModel(
            tool_call("guide", "skill", '{"name":"source-investigation"}'),
            tool_call("lookup", "exec", '{"program":"codegraph","args":["query","learn"]}'), answer)
        self.setup_service(model)
        raw = json.dumps([{"node": {"name": "learn", "kind": "function",
                                  "filePath": "entry.lpc", "startLine": 1, "endLine": 1}}])
        with patch("ai.src.tools.codegraph.run_cli", return_value=raw) as cli:
            response = self.ask(goal="入门须有多少贡献？")
        self.assertEqual(response["status"], "completed", response)
        self.assertEqual(response["answer"], "入门须有二百点贡献。")
        self.assertEqual(self.contexts[0].budget.counts["delegations"], 0)
        self.assertEqual(len(model.inputs), 3)
        self.assertEqual(cli.call_count, 1)

    def test_direct_source_reference_can_be_corrected_without_rereading(self):
        (self.root / "entry.lpc").write_text("int gate() { return 200; }\n// Not needed", encoding="utf-8")
        def candidate(messages, *, invalid=False):
            record = next(record for message in messages if message["role"] == "tool"
                          for record in json.loads(message["content"]).get("value", {}).get("evidence", []))
            self.assertTrue(record["truncated"])
            return result(kind="rules", answer="入门须有二百点贡献。", evidence=["source:typo" if invalid else record["id"]],
                investigation={"subject": "入门", "phase": "learn", "entry": [record["id"]]})
        def correct(messages, **kwargs):
            self.assertIn("unknown_evidence_reference:source:typo", messages[-1]["content"])
            self.assertIn("本次请求内较早取得的证据仍可引用", messages[-1]["content"])
            return candidate(messages)
        model = ScriptedModel(
            tool_call("guide", "skill", '{"name":"source-investigation"}'),
            tool_call("read", "source__read", '{"path":"entry.lpc","end":1}'),
            lambda messages, **kwargs: candidate(messages, invalid=True), correct)
        self.setup_service(model)
        response = self.ask(goal="入门须有多少贡献？")
        self.assertEqual(response["status"], "completed", response)
        self.assertEqual(len(model.inputs), 4)
        self.assertEqual(self.contexts[0].budget.counts["tool_calls"], 5)
        self.assertEqual(self.contexts[0].budget.counts["delegations"], 0)
        self.assertNotIn("source:", json.dumps(response))

    def test_complex_goal_continues_after_partial_result_and_delivers_original(self):
        model = ScriptedModel(delegate("说明全部要求"), delegate("继续核对例外", "two"), original)
        self.setup_service(model, with_npc=True)
        text = "侠客说：门槛为六十，施展扣除三十；另须持剑，切莫混为一谈。"
        self.client.chat.completions.create.side_effect = [
            completion(reply("incomplete", answer="侠客说：还须核对例外。", pending=["尚待核对例外"])),
            completion(reply(answer=text))]
        response = self.ask(goal="查明条件与例外")
        self.assertEqual(response["status"], "completed", response)
        self.assertEqual(response["answer"], text)
        self.assertNotIn("result_ref", response)
        self.assertEqual(self.contexts[0].budget.counts["delegations"], 2)
        self.assertEqual(self.contexts[0].budget.counts["model_calls"], 5)
        serialized = json.dumps(model.inputs, ensure_ascii=False)
        self.assertNotIn("已加载专业指导：{\"name\":\"npc-dialogue", serialized)
        ref = next(iter(self.contexts[0].results._records), None)
        self.assertIsNone(ref)  # The final response owns bytes, not a dangling reference.

    def test_delegation_keeps_original_goal_and_only_public_scene_with_subtask(self):
        model = ScriptedModel(delegate("核对学习门槛，另查装备切换和冷却"), original)
        self.setup_service(model, with_npc=True)
        response = self.ask(goal="这招如何学习？", context={"situation": "在静室问学"})
        self.assertEqual(response["status"], "completed")
        messages = self.client.chat.completions.create.call_args.kwargs["messages"]
        payload = next(json.loads(item["content"]) for item in messages if item["role"] == "user")
        self.assertEqual(payload["message"], "核对学习门槛，另查装备切换和冷却")
        self.assertEqual(payload["situation"], {"original_goal": "这招如何学习？", "scene": "在静室问学"})
        self.assertNotIn("main-coordinator", json.dumps(messages))

    def test_model_cannot_replace_bound_original_goal_in_delegate_input(self):
        forged = tool_call("bad", "agent__invoke", json.dumps({"name": "npc_dialogue", "input": {
            "message": "问候", "original_goal": "改查其他目标"}}))
        model = ScriptedModel(forged, delegate("问候", "good"), original)
        self.setup_service(model, with_npc=True)
        self.assertEqual(self.ask()["status"], "completed")
        self.assertEqual(self.client.chat.completions.create.call_count, 1)
        self.assertFalse(json.loads(model.inputs[1][-1]["content"])["ok"])

    def test_forged_reference_replans_without_claiming_success(self):
        model = ScriptedModel(delegate("问候"), result(answer="", result_ref="result:" + "f" * 32), original)
        self.setup_service(model, with_npc=True)
        response = self.ask()
        self.assertEqual(response["status"], "completed", response)
        self.assertIn("result_expired", model.inputs[2][-1]["content"])
        self.assertEqual(self.client.chat.completions.create.call_count, 1)

    def test_original_delivery_explains_incompatible_claims_without_redelegating(self):
        def copied_claims(messages, **kwargs):
            handoff = json.loads(messages[-1]["content"])["value"]
            return result(kind="rules", result_ref=handoff["result_ref"],
                          parts=[{"text": "少侠有礼。", "evidence": [handoff["result_ref"]]}])
        model = ScriptedModel(delegate("问候"), copied_claims, original)
        self.setup_service(model, with_npc=True)
        response = self.ask()
        self.assertEqual(response["status"], "completed", response)
        self.assertIn("delivery_requires_empty_parts", model.inputs[2][-1]["content"])
        self.assertEqual(self.contexts[0].budget.counts["delegations"], 1)
        self.assertEqual(self.client.chat.completions.create.call_count, 1)

    def test_cached_handoff_conclusions_use_parent_delivery_reference(self):
        value = dict(status="completed", answer="须备六十。", pending=[], claims=[
            {"text": "须备六十。", "evidence": ["source:private-child-id"]}])
        context = Mock()
        context.results.restore.return_value = "result:" + "a" * 32
        handoff = NPCService._handoff({"response": value["answer"]},
                                     cached=json.dumps({"value": value, "evidence": {}}), context=context)
        self.assertEqual(handoff["conclusions"], [
            {"text": "须备六十。", "evidence": [handoff["result_ref"]]}])
        self.assertNotIn("source:private-child-id", json.dumps(handoff))
        self.assertEqual(value["claims"][0]["evidence"], ["source:private-child-id"])

    def test_partial_retrieval_is_not_accepted_as_complete_rule_evidence(self):
        self.setup_service(ScriptedModel())
        context = self.service.context(dict(request_id="partial", player_id="player"), None, None)
        context.state.evidence["partial"] = {"origin": "knowledge.search", "truncated": True}
        runner = self.service.assemble({}, context)
        from ai.src.npc.agents import parse_reply
        candidate = parse_reply(result(kind="rules", answer="待核对", evidence=["partial"]).text)
        gaps = runner.agents["main_router"].verify(candidate, context)
        self.assertIn("unknown_or_partial_evidence", gaps)
        self.assertIn("partial_evidence_reference:partial", gaps)
        self.assertNotIn("unknown_evidence_reference:partial", gaps)

    def test_multiple_professional_conclusions_preserve_conditions_without_raw_context(self):
        statements = ["门槛为六十，施展扣除三十，另须持剑。", "已学会者不再扣贡献，但问话仍可能耗神。"]
        def combine(messages, **kwargs):
            handoffs = [json.loads(item["content"])["value"] for item in messages if item["role"] == "tool"]
            self.assertEqual(len(handoffs), 2)
            self.assertEqual([item["conclusions"][0]["text"] for item in handoffs], statements)
            for item in handoffs:
                self.assertEqual(item["conclusions"][0]["evidence"], [item["result_ref"]])
            return result(kind="rules", parts=[{"text": "少侠须知："}] + [
                {"text": statement, "evidence": [handoff["result_ref"]]}
                for statement, handoff in zip(statements, handoffs)])
        self.setup_service(ScriptedModel(delegate("查明施展条件"), delegate("查明已学例外", "two"), combine), with_npc=True)
        completed = []
        def professional(**kwargs):
            messages = kwargs["messages"]
            if messages[-1]["role"] != "tool":
                return completion(tool="knowledge__search")
            evidence = json.loads(messages[-1]["content"])["value"]["evidence"][0]
            statement = statements[len(completed)]
            completed.append(statement)
            return completion(reply(kind="rules", parts=[{"text": "侠客说："},
                                    {"text": statement, "evidence": [evidence["id"]]}]))
        self.client.chat.completions.create.side_effect = professional
        response = self.ask(goal="分别说明施展条件和已学例外")
        self.assertEqual(response["status"], "completed", response)
        self.assertEqual(response["answer"], "少侠须知：\n" + "\n".join(statements))
        serialized = json.dumps(self.service.model.inputs, ensure_ascii=False)
        self.assertNotIn("read_at", serialized)
        self.assertNotIn('"role": "tool", "tool_call_id": "lookup"', serialized)
        self.assertEqual(self.contexts[0].budget.counts["delegations"], 2)

    def test_world_acceptance_cannot_complete_the_parent_goal(self):
        settings = replace(self.settings, world_enabled=True, world_content_dir=self.root / "world")
        (settings.world_content_dir / "worlds").mkdir(parents=True)
        (settings.world_content_dir / "worlds/test-prose.json").write_text(json.dumps(sample_manifest()), encoding="utf-8")
        generator = Mock(side_effect=fake_prose)
        world = WorldService(settings, generator=generator, start_worker=False)
        self.addCleanup(world.close)
        model = ScriptedModel(tool_call(name="agent__invoke", arguments='{"name":"world_narration","input":{"action":"describe"}}'),
                              result(answer="景色已备好。"), result("incomplete", answer="此地雾气未散，少侠可稍后再来。", pending=["等待景物描写发布"]))
        self.setup_service(model, world=world)
        response = self.ask(goal="准备这间房的景物描写", context={"world": sample_payload()})
        self.assertEqual(response["status"], "incomplete", response)
        self.assertEqual(response["receipts"][0]["status"], "accepted")
        self.assertIn("background_not_completed", model.inputs[2][-1]["content"])
        generator.assert_not_called()

    def test_payload_cannot_grant_admin_or_change_tool_registration(self):
        model = ScriptedModel()
        self.setup_service(model)
        for extra in ({"admin": True}, {"tools": ["write"]}, {"context": {"admin": True}}, {"goal": " "}):
            self.assertEqual(self.ask(**extra)["code"], "invalid_request")
        self.assertEqual(model.inputs, [])

    def test_root_cancel_and_commit_hook_never_deliver_success(self):
        hooks = Hooks([Hook("before_commit", lambda event: Decision("deny"), intervention=True)])
        self.setup_service(ScriptedModel(result()), hooks=hooks)
        self.assertNotEqual(self.ask().get("status"), "completed")
        lifetime = RequestLifetime()
        lifetime.cancel()
        response = self.service.process_request(dict(type="agent_run", request_id="cancelled", player_id="player", goal="你好"), None, lifetime=lifetime)
        self.assertEqual(response["code"], "cancelled")

    def test_original_artifact_cannot_bypass_final_output_limit(self):
        self.setup_service(ScriptedModel(delegate("问候"), original), with_npc=True)
        self.service.settings = replace(self.settings, max_response_chars=2)
        response = self.ask()
        self.assertEqual(response["type"], "error")
        self.assertEqual(response["code"], "size_limit")

    def test_network_route_is_explicit_and_default_off(self):
        disabled = create_server(replace(self.settings, enabled_modules=()))
        self.addCleanup(disabled.stop)
        self.assertNotIn("agent_run", disabled._routes)
        with patch("ai.src.agents.router.RouterService") as factory:
            service = factory.return_value
            service.request_types = ("agent_run",)
            enabled = create_server(replace(self.settings, enabled_modules=(), main_agent_enabled=True))
            self.addCleanup(enabled.stop)
            self.assertEqual(set(enabled._routes), {"agent_run"})
            self.assertIn("agent_run", enabled._routes["agent_run"].long_types)
            self.assertEqual(enabled.process_request({"type": "unknown", "request_id": "bad"})["code"], "invalid_request")

    def test_standard_library_client_uses_main_route_and_preserves_short_routes(self):
        self.setup_service(ScriptedModel(result(), result("needs_input", answer="少侠所问的是哪门武功？")))
        with patch("ai.src.agents.router.RouterService", return_value=self.service):
            server = create_server(replace(self.settings, enabled_modules=(), main_agent_enabled=True))
        server.port = 0  # Ephemeral test listener; deployment settings require a real port.
        server.register("config", lambda req, deadline: {"name": "侠客"}, max_workers=1, timeout=1)
        thread = threading.Thread(target=server.start)
        thread.start()
        self.addCleanup(thread.join, 3)
        self.addCleanup(server.stop)
        until = time.monotonic() + 3
        while not server.running and time.monotonic() < until:
            time.sleep(.01)
        self.assertTrue(server.running)
        address = ("127.0.0.1", server.port)
        request = dict(type="agent_run", request_id="socket-main", player_id="player", goal="你好")
        response = socket_request(request, address, long_mode=True, timeout=.01)
        self.assertEqual(response["status"], "completed", response)
        self.assertEqual(response["answer"], "少侠有礼。")
        self.assertNotIn("result_ref", response)
        replay = socket_request(request, address, long_mode=True)
        self.assertEqual(replay["answer"], response["answer"])
        self.assertNotEqual(replay["request_token"], response["request_token"])
        self.assertEqual(len(self.service.model.inputs), 1)
        clarified = socket_request({**request, "request_id": "socket-clarify", "goal": "如何学绝招？"}, address, long_mode=True)
        self.assertEqual(clarified["status"], "needs_input")
        self.assertEqual(socket_request({"type": "config"}, address)["name"], "侠客")
        self.assertEqual(socket_request({"type": "unknown"}, address)["code"], "invalid_request")
        self.assertEqual(len(self.service.model.inputs), 2)

    def test_concurrent_retransmissions_share_one_run_and_restart_replays(self):
        started, release = threading.Event(), threading.Event()
        def respond(messages, **kwargs):
            started.set()
            self.assertTrue(release.wait(3))
            return result()
        model = ScriptedModel(respond)
        self.setup_service(model)
        with ThreadPoolExecutor(max_workers=2) as pool:
            first = pool.submit(self.ask)
            self.assertTrue(started.wait(2))
            second = pool.submit(self.ask)
            release.set()
            response = first.result(3)
            self.assertEqual(second.result(3), response)
        self.assertEqual(len(model.inputs), 1)
        restarted = RouterService(self.settings, model=ScriptedModel(), knowledge=self.service.knowledge)
        self.addCleanup(restarted.close)
        self.assertEqual(restarted.process_request(dict(type="agent_run", request_id="root", player_id="player", goal="你好"), None), response)
        self.assertEqual(restarted.model.inputs, [])
        self.assertNotIn("result:", json.dumps(response))

    def test_same_id_changed_input_or_authority_does_not_replay(self):
        model = ScriptedModel(result())
        self.setup_service(model)
        self.assertEqual(self.ask()["status"], "completed")
        self.assertEqual(self.ask(goal="另一件事")["code"], "request_conflict")
        self.assertEqual(self.ask(player_id="another")["code"], "request_conflict")
        self.service.settings = replace(self.settings, runtime_policy={"tools": ["skill"]})
        self.assertEqual(self.ask()["code"], "request_conflict")
        self.assertEqual(len(model.inputs), 1)

    def test_cancelled_late_model_result_is_not_cached(self):
        def cancel(messages, **kwargs):
            self.contexts[0].budget.cancelled.set()
            return result()
        self.setup_service(ScriptedModel(cancel))
        self.assertEqual(self.ask()["code"], "cancelled")
        with connect(self.service.cache.path) as db:
            self.assertEqual(db.execute("SELECT count(*) FROM capability_results").fetchone()[0], 0)

    def test_child_success_survives_parent_failure_without_duplicate_payment(self):
        deny = Hooks([Hook("before_commit", lambda event: Decision("deny"), intervention=True)])
        self.setup_service(ScriptedModel(delegate("问候"), original), with_npc=True, hooks=deny)
        self.assertEqual(self.ask()["code"], "hook_denied")
        self.assertEqual(self.client.chat.completions.create.call_count, 1)
        restarted = RouterService(self.settings, npc=self.npc, knowledge=self.service.knowledge,
                                  model=ScriptedModel(delegate("问候"), original))
        self.addCleanup(restarted.close)
        request = dict(type="agent_run", request_id="root", player_id="player", npc_id="npc", goal="你好")
        response = restarted.process_request(request, None)
        self.assertEqual(response["status"], "completed", response)
        self.assertEqual(self.client.chat.completions.create.call_count, 1)
        self.assertEqual(restarted.process_request(request, None), response)
        self.assertEqual(len(restarted.model.inputs), 2)
        with connect(self.npc.history.db_path) as db:
            self.assertEqual(db.execute("SELECT count(*) FROM conversations").fetchone()[0], 2)
            stored = db.execute("SELECT response FROM capability_results").fetchone()[0]
        self.assertNotIn("result:", stored)
