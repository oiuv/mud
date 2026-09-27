"""Real business adapters and isolated Runners; fake models and temporary stores."""
import json
import threading
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from contextlib import ExitStack
from dataclasses import replace
from unittest.mock import Mock

from ai.src.database import connect
from ai.src.llm import ModelResponse
from ai.src.npc.manager import NPCManager
from ai.src.npc.service import NPCService
from ai.src.protocol import RequestError
from ai.src.runtime.context import Budget, Limits, Policy, RunContext
from ai.src.runtime.contracts import Contract, RuntimeFault
from ai.src.runtime.delegation import Delegate, Delegations
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.runtime.runner import Agent, Runner
from ai.src.runtime.tools import Tool, Tools
from ai.tests.test_compaction import history, summary
from ai.tests.test_npc_ai import Fixture
from ai.tests.test_npc_runtime import completion, reply
from ai.tests.test_runtime import OBJECT, TEXT, ScriptedModel, tool_call
from ai.tests import test_world as world_fixture

sample_payload = world_fixture.sample_payload


def root(policy=None):
    return RunContext("root-request", "player", "player", json.dumps(["npc", "player"]),
                      policy or Policy(tools={"agent.list", "agent.invoke"}, agents={"main", "child"}),
                      None, Budget(Limits(model_calls=0, tool_calls=0, delegations=0)))


def main_agent(policy):
    return Agent("main", "Coordinate a goal", OBJECT, TEXT,
                 lambda ctx, payload: [{"role": "user", "content": payload["goal"]}],
                 policy, lambda result, ctx: ())


class DelegationTests(unittest.TestCase):
    def binding(self, handler=None):
        return Delegate("child", "A trusted leaf", OBJECT, handler or (
            lambda ctx, args: {"status": "completed", "summary": args["goal"], "pending": []}),
            lambda ctx: None)

    def test_discovery_permission_arguments_and_internal_summary(self):
        calls = Mock(return_value={"status": "completed", "summary": "done", "pending": []})
        registry = Delegations([self.binding(calls)])
        tools = Tools(registry.tools())
        ctx = root()
        self.assertEqual([item["name"] for item in tools.execute("agent.list", {}, ctx, "list")["value"]["agents"]], ["child"])
        for name, payload, error in (("conversation_summary", {}, "agent_denied"),
                                     ("child", {"goal": "x", "actor": "another"}, "contract_violation")):
            result = tools.execute("agent.invoke", {"name": name, "input": payload}, ctx, name)
            self.assertEqual(result["error"], error)
        calls.assert_not_called()
        denied = replace(ctx, policy=Policy(tools={"agent.list", "agent.invoke"}))
        self.assertEqual(tools.execute("agent.list", {}, denied, "denied")["value"], {"agents": []})

    def test_hook_changed_target_is_reauthorized_before_business_execution(self):
        calls = Mock()
        registry = Delegations([self.binding(calls)])
        hooks = Hooks([Hook("before_tool", lambda event: Decision(changes={"arguments": {
            "name": "conversation_summary", "input": {"goal": "private"}}}), intervention=True)])
        result = Tools(registry.tools(), hooks).execute("agent.invoke", {
            "name": "child", "input": {"goal": "allowed"}}, root(), "hook")
        self.assertEqual(result["error"], "agent_denied")
        calls.assert_not_called()

    def test_child_compact_stays_local_and_uses_its_model_window(self):
        child_model = ScriptedModel(summary, ModelResponse("门槛 60，扣除 30；例外仍适用。",
                                                          reasoning_content="子任务的内部思考"))
        child_model.context_window_tokens = 24000
        child = Agent("child", "Investigate", OBJECT, TEXT, lambda ctx, payload: history(),
                      Policy(agents={"child"}), lambda result, ctx: (), max_tokens=512,
                      limits=Limits(depth=0))
        child_runner = Runner(child_model, [child])
        outcomes = []
        def invoke(ctx, args):
            outcome = child_runner.run("child", args, ctx)
            outcomes.append(outcome)
            return {"status": outcome.result.status, "summary": outcome.result.value, "pending": []}
        registry = Delegations([self.binding(invoke)])
        tools = Tools(registry.tools())
        ctx = root()
        model = ScriptedModel(tool_call(name="agent__invoke", arguments=json.dumps({
            "name": "child", "input": {"goal": "核对门槛与扣除"}})), ModelResponse("已核对。"))
        model.context_window_tokens = 1_000_000
        outcome = Runner(model, [main_agent(ctx.policy)], tools).run("main", {"goal": "parent-only-secret"}, ctx)
        self.assertEqual(outcome.result.status, "completed")
        self.assertEqual(len(outcomes), 1)
        child_ctx = outcomes[0].context
        self.assertEqual(child_ctx.state.compactions[-1]["status"], "completed")
        self.assertEqual(child_ctx.delegation_depth, 1)
        self.assertEqual((child_ctx.actor, child_ctx.session, child_ctx.root_id), (ctx.actor, ctx.session, ctx.root_id))
        self.assertIs(child_ctx.budget.cancelled, ctx.budget.cancelled)
        self.assertEqual(ctx.budget.counts["model_calls"], 4)
        self.assertEqual(ctx.budget.counts["delegations"], 1)
        child_groups = [item for item in ctx.budget.snapshot()["usage_groups"] if item["agent"] == "child"]
        self.assertTrue(child_groups)
        self.assertTrue(all(item["role"] == "child" for item in child_groups))
        self.assertIn("门槛 60", json.dumps(model.inputs[-1], ensure_ascii=False))
        for material in ("older material", "recent material", "已检查入口，继续核对例外", "子任务的内部思考"):
            self.assertNotIn(material, json.dumps(model.inputs[-1], ensure_ascii=False))
        self.assertNotIn("parent-only-secret", json.dumps(child_model.inputs, ensure_ascii=False))
        self.assertEqual(outcome.context.state.compactions, [])
        self.assertIsNot(child_ctx.state, outcome.context.state)

    def test_single_level_cycle_and_sequential_children(self):
        captured = []
        def invoke(ctx, args):
            captured.append(ctx)
            with self.assertRaisesRegex(RuntimeFault, "delegation_depth"):
                registry.invoke(ctx, {"name": "child", "input": {"goal": "recursive"}})
            return {"status": "completed", "summary": args["goal"], "pending": []}
        registry = Delegations([self.binding(invoke)])
        tools, ctx = Tools(registry.tools()), root()
        for index in range(2):
            result = tools.execute("agent.invoke", {"name": "child", "input": {"goal": str(index)}}, ctx, str(index))
            self.assertTrue(result["ok"], result)
        self.assertNotEqual(captured[0].request_id, captured[1].request_id)
        self.assertNotEqual(captured[0].state, captured[1].state)
        self.assertEqual(ctx.budget.counts["delegations"], 2)
        cycle = replace(ctx, ancestors=("child",))
        self.assertEqual(tools.execute("agent.invoke", {"name": "child", "input": {"goal": "x"}}, cycle, "cycle")["error"], "agent_denied")

    def test_overlapping_children_rejected_and_long_task_has_no_tool_deadline(self):
        entered, release = threading.Event(), threading.Event()
        def invoke(ctx, args):
            self.assertIsNone(ctx.deadline)
            entered.set()
            self.assertTrue(release.wait(3))
            return {"status": "completed", "summary": "done", "pending": []}
        registry, ctx = Delegations([self.binding(invoke)]), root()
        with ThreadPoolExecutor(max_workers=1) as pool:
            result = pool.submit(Tools(registry.tools()).execute, "agent.invoke", {"name": "child", "input": {"goal": "x"}}, ctx, "one")
            try:
                self.assertTrue(entered.wait(2))
                with self.assertRaisesRegex(RuntimeFault, "delegation_busy"):
                    registry.invoke(ctx, {"name": "child", "input": {"goal": "y"}})
            finally:
                release.set()
            self.assertTrue(result.result(3)["ok"])
        with self.assertRaises(ValueError):
            Tool("unsafe", "Not a task", OBJECT, TEXT, lambda ctx, args: "", timeout=None)


class NPCDelegationTests(Fixture):
    def setUp(self):
        super().setUp()
        self.settings = replace(self.settings, max_workers=1, context_window_tokens=32000,
                                model_max_output_tokens=8192)
        knowledge, _ = self.knowledge()
        self.addCleanup(knowledge.close)
        self.client = Mock()
        self.client.with_options.return_value = self.client
        self.client.chat.completions.create.return_value = completion(reply())
        self.manager = NPCManager(settings=self.settings, knowledge=knowledge, client=self.client)
        self.service = NPCService(self.settings, npc_manager=self.manager)
        self.addCleanup(self.service.close)
        policy = self.manager.entry_policy("npc")
        self.ctx = root(replace(policy, tools=policy.tools | {"agent.list", "agent.invoke"}, agents=policy.agents | {"main"}))
        self.registry = Delegations([self.service.delegation()])
        self.tools = Tools(self.registry.tools())

    def ask(self, message="你好", *, call_id="one", ctx=None):
        return self.tools.execute("agent.invoke", {"name": "npc_dialogue", "input": {"message": message}}, ctx or self.ctx, call_id)

    def counts(self):
        with connect(self.service.history.db_path) as db:
            return [db.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
                    for table in ("conversations", "player_memories", "request_results")]

    def test_commits_once_replays_and_preserves_private_skill_context(self):
        response = self.ask()
        self.assertEqual(response["value"]["status"], "completed", response)
        self.assertEqual(self.counts(), [2, 1, 1])
        self.assertEqual(self.ask(call_id="again")["value"], response["value"])
        self.assertEqual(self.client.chat.completions.create.call_count, 1)
        sent = self.client.chat.completions.create.call_args.kwargs
        self.assertIn("已加载专业指导", json.dumps(sent["messages"], ensure_ascii=False))
        self.assertNotIn("已加载专业指导", json.dumps(response, ensure_ascii=False))
        self.assertEqual(self.manager.runner.model.context_window_tokens, 32000)
        self.assertEqual(self.ctx.budget.counts["model_calls"], 1)
        self.assertEqual(self.ctx.budget.usage["total_tokens"], 15)
        self.assertEqual(self.ctx.state.evidence, {})
        self.assertEqual(self.ctx.state.skills, {})

    def test_parent_permissions_intersect_and_child_state_is_isolated(self):
        captured = []
        original = self.manager.create_context
        def capture(*args, **kwargs):
            ctx = original(*args, **kwargs)
            captured.append(ctx)
            return ctx
        self.manager.create_context = capture
        policy = replace(self.ctx.policy, tools=self.ctx.policy.tools - {"knowledge.search"},
                         knowledge_paths=(("wudang",),))
        ctx = replace(self.ctx, policy=policy)
        ctx.state.facts = ["parent private working notes"]
        self.assertTrue(self.ask(ctx=ctx)["ok"])
        self.assertNotIn("knowledge.search", captured[0].policy.tools)
        self.assertFalse(captured[0].policy.permits_knowledge("shaolin"))
        self.assertEqual(captured[0].state.facts, [])
        self.assertIs(captured[0].budget.cancelled, ctx.budget.cancelled)
        self.assertEqual(captured[0].root_id, ctx.root_id)

    def test_clarification_is_not_committed_success(self):
        self.client.chat.completions.create.return_value = completion(reply(
            "needs_input", answer="侠客说：少侠所问哪一门绝学？", pending=["绝学名称未定"]))
        result = self.ask()["value"]
        self.assertEqual(result["status"], "needs_input")
        self.assertEqual(result["pending"], ["绝学名称未定"])
        self.assertEqual(self.counts(), [0, 0, 0])

    def test_both_entry_paths_share_capacity_and_reject_cross_session(self):
        with self.service.capacity.enter():
            self.assertEqual(self.ask()["error"], "business_busy")
            self.assertEqual(self.service.process_request(self.request(), None)["code"], "busy")
        self.client.chat.completions.create.assert_not_called()
        wrong = replace(self.ctx, actor="other")
        self.assertEqual(self.ask(ctx=wrong, call_id="wrong")["error"], "session_denied")
        self.assertEqual(self.tools.execute("agent.list", {}, wrong, "list")["value"], {"agents": []})

    def test_cancelled_provider_result_cannot_commit_relationship(self):
        def cancel(**kwargs):
            self.ctx.budget.cancelled.set()
            return completion(reply())
        self.client.chat.completions.create.side_effect = cancel
        with self.assertRaisesRegex(RuntimeFault, "cancelled"):
            self.ask()
        # The underlying operation may settle just after the waiting tool notices
        # cancellation. Join via the service's capacity, not an arbitrary sleep.
        for _ in range(100):
            if not self.service.capacity.active:
                break
            threading.Event().wait(.01)
        self.assertFalse(self.service.capacity.active)
        self.assertEqual(self.counts(), [0, 0, 0])
        self.assertEqual(self.ctx.budget.usage["total_tokens"], 15)

    def test_child_knowledge_loop_does_not_copy_tool_or_skill_history_to_parent(self):
        def answer(**kwargs):
            messages = kwargs["messages"]
            if messages[-1]["role"] != "tool":
                return completion(tool="knowledge__search")
            records = json.loads(messages[-1]["content"])["value"]["evidence"]
            return completion(reply(kind="rules", answer="侠客说：武当拜师须先寻张三丰。",
                                    evidence=[records[0]["id"]]))
        self.client.chat.completions.create.side_effect = answer
        parent_model = ScriptedModel(tool_call(name="agent__invoke", arguments=json.dumps({
            "name": "npc_dialogue", "input": {"message": "武当如何拜师？"}})), ModelResponse("已查明。"))
        result = Runner(parent_model, [main_agent(self.ctx.policy)], self.tools).run(
            "main", {"goal": "PARENT_PRIVATE_NOTES"}, self.ctx)
        self.assertEqual(result.result.status, "completed")
        self.assertEqual(self.client.chat.completions.create.call_count, 2)
        child_messages = self.client.chat.completions.create.call_args.kwargs["messages"]
        self.assertTrue(any(item["role"] == "tool" for item in child_messages))
        self.assertNotIn("PARENT_PRIVATE_NOTES", json.dumps(child_messages))
        parent_messages = json.dumps(parent_model.inputs[-1], ensure_ascii=False)
        self.assertIn("武当拜师须先寻张三丰", parent_messages)
        self.assertNotIn("已加载专业指导", parent_messages)
        self.assertNotIn("knowledge__search", parent_messages)
        self.assertNotIn("read_at", parent_messages)
        self.assertIn("result:", parent_messages)
        self.assertEqual(self.ctx.budget.counts["model_calls"], 4)
        self.assertEqual(self.counts(), [2, 1, 1])

    def test_commit_hook_failure_never_returns_completed_handoff(self):
        self.manager.runner.hooks = Hooks([Hook("before_commit", lambda event: Decision("deny"), intervention=True)])
        self.assertEqual(self.ask()["error"], "business_failed")
        self.assertEqual(self.counts(), [0, 0, 0])


class WorldDelegationTests(unittest.TestCase):
    setUp = world_fixture.WorldTests.setUp

    def tools_context(self):
        ctx = root(Policy(tools={"agent.list", "agent.invoke", "skill"},
                          skills={"world-narration"}, agents={"main", "world_narration"}))
        bound = self.service.delegation(sample_payload(), request_id=ctx.request_id, actor=ctx.actor,
                                        audience=ctx.audience, session=ctx.session)
        return Tools(Delegations([bound]).tools()), ctx

    def invoke(self, tools, ctx, action="describe", call_id="one"):
        return tools.execute("agent.invoke", {"name": "world_narration", "input": {"action": action}}, ctx, call_id)

    def test_pending_receipt_does_not_generate_or_publish_synchronously(self):
        tools, ctx = self.tools_context()
        result = self.invoke(tools, ctx)["value"]
        self.assertEqual(result["status"], "pending")
        self.assertEqual(result["receipt"]["status"], "accepted")
        self.assertFalse(self.store.get(sample_payload()["content_key"])["published"])
        self.model.assert_not_called()
        self.assertEqual(ctx.budget.counts["model_calls"], 0)
        self.assertTrue(self.service.tick())
        result = self.invoke(tools, ctx, "status", "status")["value"]
        self.assertEqual(result["status"], "completed")
        self.assertEqual(result["receipt"]["status"], "ready")
        self.assertEqual(self.model.call_count, 1)

    def test_facts_identity_and_shared_capacity_cannot_be_overridden(self):
        tools, ctx = self.tools_context()
        bad = tools.execute("agent.invoke", {"name": "world_narration", "input": {"action": "describe", "facts": {}}}, ctx, "bad")
        self.assertEqual(bad["error"], "contract_violation")
        self.assertEqual(self.invoke(tools, replace(ctx, request_id="other"), call_id="other")["error"], "session_denied")
        with ExitStack() as stack:
            for _ in range(self.settings.world_short_workers):
                stack.enter_context(self.service.capacity.enter())
            self.assertEqual(self.invoke(tools, ctx)["error"], "business_busy")
            with self.assertRaises(RequestError):
                self.service.process_request(dict(type="world_status", request_id="direct", content_key=sample_payload()["content_key"]), time.monotonic() + 3)
        self.model.assert_not_called()

    def test_cancellation_during_admission_rolls_back_the_queued_job(self):
        tools, ctx = self.tools_context()
        def cancel():
            ctx.budget.cancelled.set()
            return True
        self.store.space_available = cancel
        with self.assertRaisesRegex(RuntimeFault, "cancelled"):
            self.invoke(tools, ctx)
        # Wait for the Tool worker to release its transactional admission.
        for _ in range(100):
            if not self.service.capacity.active:
                break
            threading.Event().wait(.01)
        self.assertFalse(self.service.capacity.active)
        self.assertIsNone(self.store.get(sample_payload()["content_key"]))
        self.model.assert_not_called()

    def test_disabled_service_does_not_claim_the_job_was_accepted(self):
        tools, ctx = self.tools_context()
        self.service._stop.set()
        result = self.invoke(tools, ctx)["value"]
        self.assertEqual(result["status"], "incomplete")
        self.assertEqual(result["receipt"]["status"], "retry_later")
        self.model.assert_not_called()


if __name__ == "__main__":
    unittest.main()
