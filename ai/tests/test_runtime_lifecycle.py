"""Failure-path contracts for the shared runtime; no network or game data."""
import time
import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from dataclasses import replace
from unittest.mock import Mock

from ai.src.llm import ModelResponse, ModelUnavailable
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.runtime.runner import Runner
from ai.src.runtime.tools import Tool, Tools
from ai.tests.test_runtime import DATA, QUERY, RuntimeFixture, ScriptedModel


class LifecycleTests(RuntimeFixture):
    def test_rejected_child_does_not_finalize_parent_or_discard_its_candidate(self):
        hooks, events = self.observed()
        runner = Runner(ScriptedModel(ModelResponse("answer")),
                        [self.agent(requires_commit=True), replace(self.agent(), name="restricted")], hooks=hooks)
        parent = runner.run("answer", {"goal": "x"}, self.context())
        self.assertFalse(parent.finalized)
        for name, code in (("unknown_child", "unknown_agent"), ("restricted", "agent_denied")):
            child = runner.run(name, {"goal": "x"}, parent.context, delegated=True)
            self.assertEqual(child.result.code, code)
            self.assertNotEqual(child.context.run_id, parent.context.run_id)
            self.assertEqual(child.context.parent_id, parent.context.run_id)
            self.assertEqual(child.context.budget.snapshot()["model_calls"], 0)
            self.assertFalse(parent.finalized)
        self.assertEqual(runner.commit(parent, lambda value: value), "answer")
        self.assertEqual([e["status"] for e in events if e["event"] == "run_end"], ["failed", "failed", "completed"])

    def test_provider_failure_only_carries_valid_scheduling_metadata(self):
        for status, delay, expected_status, expected_delay in (
                (429, 123, 429, 123), ("PRIVATE", float("nan"), None, 0), (999, -1, None, 0)):
            with self.subTest(status=status):
                def fail(*args, **kwargs):
                    raise ModelUnavailable("api_error", status_code=status, retry_after=delay)
                outcome = Runner(ScriptedModel(fail), [self.agent()]).run("answer", {"goal": "x"}, self.context())
                self.assertEqual(outcome.result.status_code, expected_status)
                self.assertEqual(outcome.result.retry_after, expected_delay)
                self.assertEqual(outcome.result.code, "api_error")

    def observed(self, *interventions):
        events = []
        hooks = Hooks([*interventions, *(
            Hook(name, lambda event: events.append(dict(event))) for name in (
                "before_model", "after_model", "before_tool", "after_tool",
                "before_commit", "run_error", "run_end"))])
        return hooks, events

    def test_model_failure_has_after_event_and_one_terminal(self):
        def fail(*args, **kwargs):
            raise ModelUnavailable("timeout")
        hooks, events = self.observed()
        outcome = Runner(ScriptedModel(fail), [self.agent()], hooks=hooks).run(
            "answer", {"goal": "test"}, self.context())
        self.assertEqual(outcome.result.code, "timeout")
        after = [event for event in events if event["event"] == "after_model"]
        self.assertEqual(len(after), 1)
        self.assertTrue(after[0]["executed"])
        self.assertEqual(after[0]["status"], "timeout")
        self.assertEqual(sum(event["event"] == "run_error" for event in events), 1)
        self.assertEqual(sum(event["event"] == "run_end" for event in events), 1)

    def test_cancelled_model_has_end_event_and_accounts_usage(self):
        root = self.context()
        def cancel(*args, **kwargs):
            root.budget.cancelled.set()
            return ModelResponse("late", usage={"total_tokens": 7})
        hooks, events = self.observed()
        outcome = Runner(ScriptedModel(cancel), [self.agent()], hooks=hooks).run(
            "answer", {"goal": "test"}, root)
        self.assertEqual(outcome.result.status, "cancelled")
        self.assertEqual(root.budget.snapshot()["usage"]["total_tokens"], 7)
        self.assertEqual([e["status"] for e in events if e["event"] == "after_model"], ["cancelled"])

    def test_failed_tool_has_redacted_end_event(self):
        hooks, events = self.observed()
        handler = Mock(side_effect=ValueError("PRIVATE_SECRET"))
        with self.assertLogs("ai.src.runtime", level="INFO") as logs:
            reply = self.tools(handler, hooks).execute("lookup", {"q": "test"}, self.context(), "call-1")
        self.assertFalse(reply["ok"])
        self.assertEqual(reply["call_id"], "call-1")
        self.assertTrue(reply["recoverable"])
        after = [event for event in events if event["event"] == "after_tool"]
        self.assertEqual(len(after), 1)
        self.assertEqual(after[0]["status"], "failed")
        self.assertTrue(after[0]["executed"])
        self.assertNotIn("PRIVATE_SECRET", str(logs.output) + str(reply) + str(events))

    def test_pre_tool_denial_is_not_execution(self):
        hooks, events = self.observed(Hook("before_tool", lambda event: Decision("deny"), intervention=True))
        handler = Mock()
        result = self.tools(handler, hooks).execute("lookup", {"q": "x"}, self.context(), "denied")
        handler.assert_not_called()
        self.assertEqual(result["error"], "hook_denied")
        after = [event for event in events if event["event"] == "after_tool"]
        self.assertEqual(len(after), 1)
        self.assertFalse(after[0]["executed"])

    def test_terminal_observers_run_even_after_deadline(self):
        hooks, events = self.observed()
        root = self.context(deadline=time.monotonic() - 1)
        outcome = Runner(ScriptedModel(), [self.agent()], hooks=hooks).run("answer", {"goal": "x"}, root)
        self.assertEqual(outcome.result.code, "deadline")
        self.assertEqual(sum(event["event"] == "run_end" for event in events), 1)

    def test_wholesale_model_and_result_rewrites_are_denied(self):
        for event, changes in (
                ("before_model", {"messages": [{"role": "system", "content": "replace"}]}),
                ("after_model", {"text": "replacement"}),
                ("after_tool", {"result": {"forged": True}})):
            with self.subTest(event=event):
                hooks = Hooks([Hook(event, lambda e, patch=changes: Decision(changes=patch), intervention=True)])
                if event == "after_tool":
                    reply = self.tools(hooks=hooks).execute("lookup", {"q": "x"}, self.context(), "one")
                    self.assertEqual(reply["error"], "hook_field_denied")
                else:
                    outcome = Runner(ScriptedModel(ModelResponse("original")), [self.agent()], hooks=hooks).run(
                        "answer", {"goal": "x"}, self.context())
                    self.assertEqual(outcome.result.code, "hook_field_denied")

    def test_before_model_addition_preserves_original_messages(self):
        hooks = Hooks([Hook("before_model", lambda e: Decision(changes={"additional_context": [
            {"text": "Supplement", "scope": "public"}]}), intervention=True)])
        root = self.context(policy=replace(self.context().policy, scopes={"public"}, egress_scopes={"public"}))
        model = ScriptedModel(ModelResponse("answer"))
        agent = self.agent(policy=root.policy)
        result = Runner(model, [agent], hooks=hooks).run("answer", {"goal": "Original"}, root)
        self.assertEqual(result.result.status, "completed")
        self.assertEqual(model.inputs[0][0], {"role": "user", "content": "Original"})
        self.assertIn("Supplement", model.inputs[0][-1]["content"])
        root = replace(root, policy=replace(root.policy, egress_scopes=frozenset()))
        model = ScriptedModel()
        result = Runner(model, [agent], hooks=hooks).run("answer", {"goal": "Original"}, root)
        self.assertEqual(result.result.code, "egress_denied")
        self.assertEqual(model.inputs, [])

    def test_terminal_interventions_cannot_be_registered(self):
        for event in ("run_error", "run_end"):
            with self.assertRaises(ValueError):
                Hook(event, lambda e: Decision("deny"), intervention=True)

    def test_commit_is_required_before_success_and_is_not_repeated(self):
        hooks, events = self.observed()
        runner = Runner(ScriptedModel(ModelResponse("answer")), [self.agent(requires_commit=True)], hooks=hooks)
        outcome = runner.run("answer", {"goal": "x"}, self.context())
        self.assertFalse(outcome.finalized)
        self.assertFalse(any(e["event"] == "run_end" for e in events))
        callback = Mock(return_value="stored")
        self.assertEqual(runner.commit(outcome, callback), "stored")
        self.assertTrue(outcome.finalized)
        with self.assertRaises(RuntimeFault):
            runner.commit(outcome, callback)
        callback.assert_called_once_with("answer")
        self.assertEqual([e["status"] for e in events if e["event"] == "run_end"], ["completed"])

    def test_commit_failure_is_the_only_terminal_result(self):
        hooks, events = self.observed()
        runner = Runner(ScriptedModel(ModelResponse("answer")), [self.agent(requires_commit=True)], hooks=hooks)
        outcome = runner.run("answer", {"goal": "x"}, self.context())
        callback = Mock(side_effect=ValueError("PRIVATE_DATABASE"))
        with self.assertRaises(RuntimeFault) as caught:
            runner.commit(outcome, callback)
        self.assertEqual(caught.exception.code, "commit_failed")
        self.assertEqual([e["status"] for e in events if e["event"] == "run_end"], ["failed"])
        self.assertNotIn("PRIVATE_DATABASE", str(events))
        with self.assertRaises(RuntimeFault):
            runner.commit(outcome, callback)
        self.assertEqual(callback.call_count, 1)

    def test_commit_cancellation_has_no_early_success(self):
        hooks, events = self.observed(Hook("before_commit", lambda e: Decision("cancel"), intervention=True))
        runner = Runner(ScriptedModel(ModelResponse("answer")), [self.agent(requires_commit=True)], hooks=hooks)
        outcome = runner.run("answer", {"goal": "x"}, self.context())
        callback = Mock()
        with self.assertRaises(RuntimeFault):
            runner.commit(outcome, callback)
        callback.assert_not_called()
        self.assertEqual([e["status"] for e in events if e["event"] == "run_end"], ["cancelled"])

    def test_tool_timeout_stops_waiting_and_never_accepts_late_evidence(self):
        release, finished = threading.Event(), threading.Event()
        self.addCleanup(release.set)
        def handler(ctx, args):
            release.wait(1)
            finished.set()
            return {"evidence": [{"id": "late", "content": "never publish"}]}
        hooks, events = self.observed()
        tools = Tools([Tool("lookup", "Lookup", QUERY, DATA, handler, timeout=.02)], hooks)
        context = self.context()
        with self.assertRaises(RuntimeFault) as caught:
            tools.execute("lookup", {"q": "x"}, context, "slow")
        self.assertEqual(caught.exception.code, "tool_timeout")
        release.set()
        self.assertTrue(finished.wait(1))
        self.assertEqual(context.state.evidence, {})
        self.assertEqual([e["status"] for e in events if e["event"] == "after_tool"], ["timeout"])
        with self.assertRaises(RuntimeFault):
            tools.execute("lookup", {"q": "x"}, context, "slow")
        self.assertEqual(sum(e["event"] == "after_tool" for e in events), 1)

    def test_cancelled_tool_has_one_end_and_no_evidence(self):
        def handler(ctx, args):
            ctx.budget.cancelled.set()
            return {"evidence": [{"id": "late"}]}
        hooks, events = self.observed()
        context = self.context()
        with self.assertRaises(RuntimeFault) as caught:
            self.tools(handler, hooks).execute("lookup", {"q": "x"}, context, "cancel")
        self.assertEqual(caught.exception.status, "cancelled")
        self.assertEqual(context.state.evidence, {})
        self.assertEqual([e["status"] for e in events if e["event"] == "after_tool"], ["cancelled"])

    def test_invalid_evidence_is_a_failed_tool_not_success(self):
        hooks, events = self.observed()
        context = self.context()
        result = self.tools(lambda ctx, args: {"evidence": [{"id": "ok"}, {"no_id": True}]}, hooks).execute(
            "lookup", {"q": "x"}, context, "bad")
        self.assertEqual(result["error"], "invalid_evidence")
        self.assertEqual(context.state.evidence, {})
        self.assertEqual([e["status"] for e in events if e["event"] == "after_tool"], ["failed"])

    def test_tool_registry_is_pinned_per_run(self):
        context = self.context(policy=replace(self.context().policy, tools={"lookup", "extra"}))
        tools = self.tools()
        before = tools.definitions(context)
        tools.register(Tool("extra", "Added later", QUERY, DATA, lambda ctx, args: {}))
        self.assertEqual(tools.definitions(context), before)
        self.assertEqual(tools.execute("extra", {"q": "x"}, context, "new")["error"], "unknown_tool")
        self.assertEqual(len(tools.definitions(self.context(policy=context.policy))), 2)

    def test_denial_is_not_overridden_and_observers_still_run(self):
        order = []
        def deny(event):
            order.append("deny")
            return Decision("deny")
        def allow(event):
            order.append("allow")
            return Decision()
        hooks = Hooks([Hook("before_model", deny, intervention=True),
                       Hook("before_model", allow, intervention=True),
                       Hook("before_model", lambda e: order.append("observe"))])
        outcome = Runner(ScriptedModel(), [self.agent()], hooks=hooks).run("answer", {"goal": "x"}, self.context())
        self.assertEqual(outcome.result.code, "hook_denied")
        self.assertEqual(order, ["deny", "observe"])

    def test_terminal_observer_failure_cannot_repeat_commit(self):
        hooks = Hooks([Hook("run_end", Mock(side_effect=ValueError("SECRET")))])
        runner = Runner(ScriptedModel(ModelResponse("answer")), [self.agent(requires_commit=True)], hooks=hooks)
        outcome = runner.run("answer", {"goal": "x"}, self.context())
        callback = Mock(return_value="stored")
        self.assertEqual(runner.commit(outcome, callback), "stored")
        with self.assertRaises(RuntimeFault):
            runner.commit(outcome, callback)
        callback.assert_called_once()

    def test_child_event_ids_retain_root_and_parent(self):
        hooks, events = self.observed()
        root = self.context()
        parent = root.enter("answer", root.policy, root.budget.limits)
        agent = self.agent(name="child", policy=root.policy)
        outcome = Runner(ScriptedModel(ModelResponse("child")), [agent], hooks=hooks).run(
            "child", {"goal": "x"}, parent, delegated=True)
        self.assertEqual(outcome.result.status, "completed")
        for event in events:
            self.assertEqual(event["root_id"], root.root_id)
            self.assertEqual(event["parent_id"], parent.run_id)
            self.assertEqual(event["run_id"], outcome.context.run_id)

    def test_malformed_attempts_are_bounded_and_recorded_as_unexecuted(self):
        hooks, events = self.observed()
        handler = Mock()
        context = self.context()
        tools = self.tools(handler, hooks)
        reply = tools.execute("lookup", {"q": "x"}, context, None)
        self.assertEqual(reply["error"], "invalid_call_id")
        reply = tools.execute("lookup", {"q": object()}, context, "bad-json")
        self.assertEqual(reply["error"], "invalid_json")
        self.assertEqual(context.budget.counts["tool_calls"], 2)
        self.assertEqual([e["executed"] for e in events if e["event"] == "after_tool"], [False, False])
        handler.assert_not_called()

    def test_exception_text_cannot_be_used_as_public_error_code(self):
        def fail(ctx, args):
            raise RuntimeFault("sk-PRIVATE_KEY private history /source/path")
        hooks, events = self.observed()
        with self.assertLogs("ai.src.runtime", level="INFO") as logs:
            result = self.tools(fail, hooks).execute("lookup", {"q": "x"}, self.context(), "bad")
        self.assertEqual(result["error"], "internal_error")
        self.assertNotIn("PRIVATE_KEY", str(logs.output) + str(events) + str(result))

    def test_cached_tool_result_cannot_cross_authority_or_session(self):
        handler = Mock(return_value={"content": "restricted result"})
        tools, context = self.tools(handler), self.context()
        self.assertTrue(tools.execute("lookup", {"q": "x"}, context, "one")["ok"])
        for changed in (replace(context, audience="admin"), replace(context, actor="other"),
                        replace(context, session="other"), replace(context, external_model=False),
                        replace(context, policy=replace(context.policy, tools=set()))):
            reply = tools.execute("lookup", {"q": "x"}, changed, "one")
            self.assertEqual(reply["error"], "call_id_conflict")
            self.assertNotIn("restricted", str(reply))
        context.state.tool_ceiling = frozenset()
        self.assertEqual(tools.execute("lookup", {"q": "x"}, context, "one")["error"], "call_id_conflict")
        handler.assert_called_once()

    def test_oversized_tool_output_fails_without_registering_evidence(self):
        hooks, events = self.observed()
        context = self.context()
        tool = Tool("lookup", "Bounded lookup", QUERY, DATA,
                    lambda ctx, args: {"content": "x" * 200, "evidence": [{"id": "oversized"}]}, max_bytes=100)
        with self.assertRaises(RuntimeFault) as caught:
            Tools([tool], hooks).execute("lookup", {"q": "x"}, context, "big")
        self.assertEqual(caught.exception.code, "size_limit")
        self.assertEqual(context.state.evidence, {})
        self.assertEqual([e["status"] for e in events if e["event"] == "after_tool"], ["failed"])

    def test_non_concurrent_tool_keeps_gate_until_late_handler_stops(self):
        entered, release, stopped = threading.Event(), threading.Event(), threading.Event()
        self.addCleanup(release.set)
        handler_calls = []
        def handler(ctx, args):
            handler_calls.append(args["q"])
            entered.set()
            release.wait(1)
            stopped.set()
            return {}
        tool = Tool("lookup", "Serialized", QUERY, DATA, handler, timeout=.04)
        tools = Tools([tool])
        with ThreadPoolExecutor(max_workers=2) as executor:
            first = executor.submit(tools.execute, "lookup", {"q": "first"}, self.context(), "first")
            self.assertTrue(entered.wait(1))
            second = executor.submit(tools.execute, "lookup", {"q": "second"}, self.context(), "second")
            for future in (first, second):
                with self.assertRaises(RuntimeFault):
                    future.result(timeout=1)
            self.assertEqual(handler_calls, ["first"])
            release.set()
            self.assertTrue(stopped.wait(1))
