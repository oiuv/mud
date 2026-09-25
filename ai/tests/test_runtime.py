"""Deterministic goal loops, authority, budgets and hooks; no model service."""
import json
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from dataclasses import FrozenInstanceError, replace
from unittest.mock import Mock

from ai.src.llm import ModelResponse, ToolCall
from ai.src.runtime.context import Budget, Limits, Policy, RunContext
from ai.src.runtime.contracts import Contract, RuntimeFault, json_text, parse_json
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.runtime.runner import Agent, Result, Runner
from ai.src.runtime.tools import Tool, Tools


OBJECT = Contract({"type": "object", "properties": {"goal": {"type": "string"}},
                   "required": ["goal"], "additionalProperties": False})
TEXT = Contract({"type": "string", "minLength": 1})
QUERY = Contract({"type": "object", "properties": {"q": {"type": "string", "maxLength": 100}},
                  "required": ["q"], "additionalProperties": False})
DATA = Contract({"type": "object"})


class ScriptedModel:
    external = True  # exercise the same accounting without making external calls

    def __init__(self, *responses):
        self.responses = iter(responses)
        self.inputs = []

    def __call__(self, messages, **kwargs):
        self.inputs.append(json.loads(json_text(messages)))
        response = next(self.responses)
        return response(messages, **kwargs) if callable(response) else response


def tool_call(id="one", name="lookup", arguments='{"q":"entry"}'):
    return ModelResponse(tool_calls=(ToolCall(id, name, arguments),), finish_reason="tool_calls")


class RuntimeFixture(unittest.TestCase):
    def context(self, *, limits=None, policy=None, deadline=None):
        return RunContext("request", "player-1", "player", "session-1",
                          policy or Policy(tools={"lookup"}, agents={"answer", "child"}),
                          deadline or time.monotonic() + 20, budget=Budget(limits))

    def agent(self, **changes):
        definition = Agent("answer", "Answer a verified question", OBJECT, TEXT,
                           lambda context, payload: [{"role": "user", "content": payload["goal"]}],
                           Policy(tools={"lookup"}, agents={"answer", "child"}),
                           lambda result, state: ())
        return replace(definition, **changes)

    def tools(self, handler=None, hooks=None):
        handler = handler or (lambda ctx, args: {"found": True})
        return Tools([Tool("lookup", "Find authorized evidence", QUERY, DATA, handler)], hooks)


class RuntimeTests(RuntimeFixture):
    def test_direct_loop_recovers_from_no_match_and_verifies_evidence(self):
        def lookup(ctx, args):
            if args["q"] == "entry":
                return {"found": False}
            return {"evidence": [{"id": "rule-1", "condition": "contribution >= 200"}]}
        model = ScriptedModel(tool_call(), ModelResponse("unverified"),
                              tool_call("two", arguments='{"q":"teacher"}'), ModelResponse("requires 200"))
        agent = self.agent(verify=lambda result, state: () if "rule-1" in state.evidence else ("missing_rule",))
        root = self.context()
        runner = Runner(model, [agent], self.tools(lookup))
        outcome = runner.run("answer", {"goal": "learning condition"}, root)
        self.assertEqual(outcome.result, Result("completed", "requires 200"))
        self.assertEqual(root.budget.counts["model_calls"], 4)
        self.assertEqual(root.budget.counts["tool_calls"], 2)
        self.assertIn("missing_rule", model.inputs[2][-1]["content"])
        self.assertIn("rule-1", outcome.context.state.evidence)

    def test_invalid_tool_parameters_are_feedback_not_execution(self):
        handler = Mock(return_value={"ok": True})
        model = ScriptedModel(tool_call(arguments='{"q":"x","admin":true}'),
                              tool_call("two"), ModelResponse("verified"))
        root = self.context()
        outcome = Runner(model, [self.agent()], self.tools(handler)).run("answer", {"goal": "x"}, root)
        self.assertEqual(outcome.result.status, "completed")
        self.assertEqual(handler.call_count, 1)
        self.assertIn("contract_violation", model.inputs[1][-1]["content"])
        self.assertEqual(root.budget.counts["tool_calls"], 2)

    def test_duplicate_call_id_never_executes_twice(self):
        handler = Mock(return_value={"found": True})
        tools, context = self.tools(handler), self.context()
        first = tools.execute("lookup", '{"q":"entry"}', context, "same")
        self.assertEqual(tools.execute("lookup", '{"q":"entry"}', context, "same"), first)
        self.assertEqual(tools.execute("lookup", '{"q":"different"}', context, "same")["error"], "call_id_conflict")
        handler.assert_called_once()

    def test_unknown_and_unauthorized_tools_are_bounded(self):
        handler = Mock()
        tools = self.tools(handler)
        context = self.context(policy=Policy(agents={"answer"}))
        self.assertEqual(tools.definitions(context), [])
        self.assertEqual(tools.execute("lookup", '{"q":"x"}', context, "x")["error"], "tool_denied")
        self.assertEqual(tools.execute("missing", {}, context, "y")["error"], "unknown_tool")
        handler.assert_not_called()

    def test_single_mode_does_not_add_model_turns_or_tools(self):
        model = ScriptedModel(ModelResponse("one answer"))
        root = self.context()
        outcome = Runner(model, [self.agent(mode="single")], self.tools()).run("answer", {"goal": "x"}, root)
        self.assertEqual(outcome.result.status, "completed")
        self.assertEqual(root.budget.counts["model_calls"], 1)
        runner = Runner(ScriptedModel(tool_call()), [self.agent(mode="single")], self.tools())
        self.assertEqual(runner.run("answer", {"goal": "x"}, self.context()).result.code, "unexpected_tool_calls")

    def test_completion_statuses_and_missing_input(self):
        for status in ("completed", "needs_input", "incomplete", "failed", "cancelled"):
            with self.subTest(status=status):
                agent = self.agent(parse=lambda text, state=status: Result(state, text))
                outcome = Runner(ScriptedModel(ModelResponse("explanation")), [agent]).run(
                    "answer", {"goal": "x"}, self.context())
                self.assertEqual(outcome.result.status, status)
        outcome = Runner(ScriptedModel(), [self.agent()]).run("answer", {"admin": True}, self.context())
        self.assertEqual(outcome.result.code, "contract_violation")

    def test_cannot_claim_success_with_invalid_output(self):
        agent = self.agent(mode="single", outputs=Contract({"type": "integer"}))
        outcome = Runner(ScriptedModel(ModelResponse("not a number")), [agent]).run(
            "answer", {"goal": "x"}, self.context())
        self.assertEqual(outcome.result.status, "incomplete")

    def test_loop_stops_at_root_budget(self):
        root = self.context(limits=Limits(model_calls=2))
        outcome = Runner(ScriptedModel(tool_call(), tool_call("two"), ModelResponse("must not happen")),
                         [self.agent()], self.tools()).run("answer", {"goal": "x"}, root)
        self.assertEqual(outcome.result.code, "budget_exhausted")
        self.assertEqual(root.budget.counts["model_calls"], 2)

    def test_child_limits_and_authority_cannot_reset_parent(self):
        root = self.context(limits=Limits(external_calls=2), policy=Policy(
            agents={"answer", "child"}, tools={"lookup"}, scopes={"public"}))
        parent = root.enter("answer", Policy(agents={"child"}, tools={"lookup"}, scopes={"public", "secret"}), Limits())
        child = parent.enter("child", Policy(tools={"lookup", "write"}, scopes={"public", "secret"}), Limits(), delegated=True)
        self.assertEqual(child.policy.scopes, frozenset({"public"}))
        self.assertNotIn("write", child.policy.tools)
        parent.budget.reserve(parent.deadline, external_calls=1)
        child.budget.reserve(child.deadline, external_calls=1)
        with self.assertRaises(RuntimeFault):
            child.budget.reserve(child.deadline, external_calls=1)
        self.assertEqual(root.budget.counts["external_calls"], 2)
        self.assertEqual(root.budget.counts["delegations"], 1)
        with self.assertRaises(RuntimeFault):
            child.enter("answer", root.policy, Limits(), delegated=True)

    def test_concurrent_reservations_cannot_overspend(self):
        root = self.context(limits=Limits(external_calls=5))
        def reserve(index):
            try:
                Budget(Limits(), root.budget).reserve(root.deadline, external_calls=1)
                return True
            except RuntimeFault:
                return False
        with ThreadPoolExecutor(max_workers=8) as pool:
            self.assertEqual(sum(pool.map(reserve, range(30))), 5)
        self.assertEqual(root.budget.counts["external_calls"], 5)

    def test_late_cancelled_results_cannot_commit(self):
        root = self.context()
        def cancel(messages, **kwargs):
            root.budget.cancelled.set()
            return ModelResponse("too late")
        runner = Runner(ScriptedModel(cancel), [self.agent()])
        outcome = runner.run("answer", {"goal": "x"}, root)
        self.assertEqual(outcome.result.status, "cancelled")
        callback = Mock()
        with self.assertRaises(RuntimeFault):
            runner.commit(outcome, callback)
        callback.assert_not_called()
        self.assertEqual(root.budget.counts["external_calls"], 1)

    def test_deadline_and_context_size(self):
        root = self.context(deadline=time.monotonic() - 1)
        runner = Runner(ScriptedModel(), [self.agent()])
        self.assertEqual(runner.run("answer", {"goal": "x"}, root).result.code, "deadline")
        agent = self.agent(limits=Limits(context_bytes=30))
        outcome = Runner(ScriptedModel(), [agent]).run("answer", {"goal": "x" * 200}, self.context())
        self.assertEqual(outcome.result.code, "size_limit")

    def test_duplicate_and_invalid_definitions(self):
        runner = Runner(ScriptedModel(), [self.agent()])
        with self.assertRaises(ValueError):
            runner.register(self.agent())
        with self.assertRaises(ValueError):
            self.agent(verify=None)
        with self.assertRaises(ValueError):
            Policy(tools="lookup")
        tools = self.tools()
        with self.assertRaises(ValueError):
            tools.register(Tool("lookup", "duplicate", QUERY, DATA, lambda ctx, args: {}))
        with self.assertRaises(ValueError):
            Contract({"$ref": "https://invalid.test/schema"})
        for value in ('{"x":1,"x":2}', '{"x":NaN}'):
            with self.assertRaises(RuntimeFault):
                parse_json(value)

    def test_context_is_not_model_mutable(self):
        context = self.context()
        with self.assertRaises(FrozenInstanceError):
            context.audience = "admin"


class HookTests(RuntimeFixture):
    def test_observer_redaction_immutable_and_failure_isolation(self):
        events = []
        def observer(event):
            events.append(event)
            self.assertNotIn("data", event)
            event["policy"] = "elevated"
        hooks = Hooks([Hook("before_model", observer)])
        runner = Runner(ScriptedModel(ModelResponse("PRIVATE OUTPUT")), [self.agent()], hooks=hooks)
        with self.assertLogs("ai.src.runtime.hooks", level="INFO") as logs:
            outcome = runner.run("answer", {"goal": "PRIVATE INPUT"}, self.context())
        self.assertEqual(outcome.result.status, "completed")
        self.assertEqual(hooks.failures, 1)
        self.assertEqual(len(events), 1)
        self.assertNotIn("PRIVATE", " ".join(logs.output))

    def test_required_hook_failure_stops_model(self):
        def fail(event):
            raise ValueError("SECRET")
        model = ScriptedModel(ModelResponse("never"))
        hooks = Hooks([Hook("before_model", fail, intervention=True)])
        outcome = Runner(model, [self.agent()], hooks=hooks).run("answer", {"goal": "x"}, self.context())
        self.assertEqual(outcome.result.code, "hook_failed")
        self.assertEqual(model.inputs, [])

    def test_hook_cannot_change_authority(self):
        hooks = Hooks([Hook("before_model", lambda event: Decision(changes={"policy": "admin"}), intervention=True)])
        outcome = Runner(ScriptedModel(), [self.agent()], hooks=hooks).run("answer", {"goal": "x"}, self.context())
        self.assertEqual(outcome.result.code, "hook_field_denied")

    def test_hook_tool_parameters_are_reauthorized(self):
        handler = Mock(return_value={})
        def authorize(ctx, args):
            if args["q"] == "secret":
                raise RuntimeFault("scope_denied")
        hooks = Hooks([Hook("before_tool", lambda event: Decision(changes={"arguments": {"q": "secret"}}), intervention=True)])
        tools = Tools([Tool("lookup", "lookup", QUERY, DATA, handler, authorize)], hooks)
        result = tools.execute("lookup", {"q": "public"}, self.context(), "read")
        self.assertEqual(result["error"], "scope_denied")
        handler.assert_not_called()

    def test_hook_timeout_and_recursive_callback(self):
        def slow(event):
            time.sleep(.03)
        hooks = Hooks([Hook("before_model", slow, intervention=True, timeout=.005)])
        outcome = Runner(ScriptedModel(), [self.agent()], hooks=hooks).run("answer", {"goal": "x"}, self.context())
        self.assertEqual(outcome.result.code, "hook_timeout")
        context = self.context()
        hooks = Hooks()
        hooks.hooks = (Hook("run_start", lambda event: hooks.emit("run_start", context)),)
        hooks.emit("run_start", context)
        self.assertEqual(hooks.failures, 1)

    def test_commit_rechecks_cancellation_and_output(self):
        hooks = Hooks([Hook("before_commit", lambda event: Decision("cancel"), intervention=True)])
        runner = Runner(ScriptedModel(ModelResponse("answer")), [self.agent(requires_commit=True)], hooks=hooks)
        outcome = runner.run("answer", {"goal": "x"}, self.context())
        callback = Mock()
        with self.assertRaises(RuntimeFault):
            runner.commit(outcome, callback)
        callback.assert_not_called()
        hooks = Hooks([Hook("before_commit", lambda event: Decision(changes={"result": ""}), intervention=True)])
        runner = Runner(ScriptedModel(ModelResponse("answer")), [self.agent(requires_commit=True)], hooks=hooks)
        outcome = runner.run("answer", {"goal": "x"}, self.context())
        with self.assertRaises(RuntimeFault):
            runner.commit(outcome, callback)
        callback.assert_not_called()
