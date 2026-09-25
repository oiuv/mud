"""Observable loop progress using fake models/tools; no provider or game data."""
from dataclasses import replace
from unittest.mock import Mock

from ai.src.llm import ModelResponse, ToolCall
from ai.src.runtime.context import Limits
from ai.src.runtime.contracts import Contract, RuntimeFault
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.runtime.progress import observation
from ai.src.runtime.runner import Result, Runner
from ai.src.runtime.tools import Tool, Tools
from ai.tests.test_runtime import DATA, RuntimeFixture, ScriptedModel, tool_call


class ProgressTests(RuntimeFixture):
    def run_loop(self, model, *, handler=None, agent=None, tools=None, context=None):
        return Runner(model, [agent or self.agent(no_progress_limit=2)],
                      tools or self.tools(handler)).run("answer", {"goal": "核对学习条件"},
                                                      context or self.context())

    def test_repeated_failure_gets_feedback_then_incomplete(self):
        handler = Mock(side_effect=RuntimeFault("missing_entry"))
        model = ScriptedModel(*(tool_call(str(i)) for i in range(4)))
        outcome = self.run_loop(model, handler=handler)
        self.assertEqual(outcome.result, Result("incomplete", code="no_progress"))
        self.assertEqual(len(model.inputs), 3)
        self.assertEqual(handler.call_count, 3)
        self.assertIn("连续 1 轮", model.inputs[2][-1]["content"])
        self.assertEqual(outcome.context.state.pending, ["goal_completion_unverified"])
        self.assertEqual(outcome.context.budget.snapshot()["model_calls"], 3)
        self.assertEqual(outcome.context.budget.snapshot()["tool_calls"], 3)

    def test_json_key_order_and_whitespace_do_not_reset_progress(self):
        tool = Tool("lookup", "测试规范化参数", Contract({"type": "object"}), DATA,
                    lambda ctx, args: {"found": False})
        model = ScriptedModel(tool_call("1", arguments='{"q":"x","limit":2}'),
                              tool_call("2", arguments='{ "limit": 2, "q": "x" }'),
                              tool_call("3", arguments='{"q": "x", "limit": 2}'))
        outcome = self.run_loop(model, tools=Tools([tool]))
        self.assertEqual(outcome.result.code, "no_progress")

    def test_evidence_ids_read_times_and_order_are_not_new_facts(self):
        count = 0

        def lookup(ctx, args):
            nonlocal count
            count += 1
            records = [{"id": f"{count}-{i}", "read_at": str(count), "scope": "rules",
                        "path": "learn.lpc", "start": i, "end": i,
                        "hash": "same-file", "content": f"condition {i}"} for i in (1, 2)]
            return {"evidence": records if count % 2 else list(reversed(records))}

        model = ScriptedModel(*(tool_call(str(i)) for i in range(4)))
        outcome = self.run_loop(model, handler=lookup)
        self.assertEqual(outcome.result.code, "no_progress")
        self.assertEqual(len(outcome.context.state.evidence), 6)
        self.assertEqual(len(model.inputs), 3)

    def test_new_query_can_recover_from_no_match(self):
        model = ScriptedModel(tool_call("1"), tool_call("2"),
                              tool_call("3", arguments='{"q":"teacher"}'), ModelResponse("需要贡献二百"))
        outcome = self.run_loop(model, handler=lambda ctx, args: {"found": args["q"] == "teacher"})
        self.assertEqual(outcome.result.status, "completed")
        self.assertEqual(len(model.inputs), 4)

    def test_changed_source_content_or_version_allows_rereading(self):
        for field in ("hash", "content", "start"):
            with self.subTest(field=field):
                count = 0

                def lookup(ctx, args):
                    nonlocal count
                    count += 1
                    record = {"id": str(count), "scope": "rules", "path": "learn.lpc",
                              "hash": "version-a", "content": "required=200", "start": 1}
                    if count >= 3:
                        record[field] = 2 if field == "start" else "changed"
                    return {"evidence": [record]}

                model = ScriptedModel(*(tool_call(str(i)) for i in range(4)), ModelResponse("已核对"))
                outcome = self.run_loop(model, handler=lookup)
                self.assertEqual(outcome.result.status, "completed")
                self.assertEqual(count, 4)

    def test_progress_uses_effective_hook_arguments(self):
        count = 0

        def adjust(event):
            nonlocal count
            count += 1
            return Decision(changes={"arguments": {"q": str(count)}})

        hooks = Hooks([Hook("before_tool", adjust, intervention=True, raw_data=True)])
        model = ScriptedModel(*(tool_call(str(i)) for i in range(3)), ModelResponse("已完成"))
        runner = Runner(model, [self.agent(no_progress_limit=2)],
                        self.tools(lambda ctx, args: {"found": False}), hooks=hooks)
        outcome = runner.run("answer", {"goal": "x"}, self.context())
        self.assertEqual(outcome.result.status, "completed")
        self.assertEqual(count, 3)

    def test_batch_gets_feedback_only_after_all_tool_replies(self):
        calls = tuple(ToolCall(str(i), "lookup", '{"q":"entry"}') for i in range(5))
        model = ScriptedModel(ModelResponse(tool_calls=calls, finish_reason="tool_calls"),
                              ModelResponse("已核对"))
        outcome = self.run_loop(model)
        self.assertEqual(outcome.result.status, "completed")
        self.assertEqual(sum(message["role"] == "tool" for message in model.inputs[1]), 5)

    def test_same_gaps_ignore_candidate_rewording(self):
        model = ScriptedModel(*(ModelResponse(f"换一种说法 {i}") for i in range(4)))
        outcome = self.run_loop(model, agent=self.agent(no_progress_limit=2,
                               verify=lambda result, state: ("missing_rule",)))
        self.assertEqual(outcome.result.code, "no_progress")
        self.assertEqual(outcome.context.state.pending, ["missing_rule"])
        self.assertIn("连续 1 轮", model.inputs[2][-1]["content"])
        self.assertEqual(outcome.context.budget.snapshot()["tool_calls"], 0)

    def test_reducing_verified_gaps_allows_completion(self):
        gaps = {"none": ("entry", "cost"), "entry": ("cost",), "done": ()}
        agent = self.agent(no_progress_limit=2, verify=lambda result, state: gaps[result.value])
        model = ScriptedModel(*(ModelResponse(text) for text in ("none", "none", "entry", "entry", "done")))
        outcome = self.run_loop(model, agent=agent)
        self.assertEqual(outcome.result.status, "completed")
        self.assertEqual(len(model.inputs), 5)
        self.assertEqual(outcome.context.state.pending, [])

    def test_reordering_or_reintroducing_known_gaps_is_not_progress(self):
        gaps = {"first": ("a", "b"), "reordered": ("b", "a"),
                "reduced": ("a",), "regressed": ("a", "b")}
        agent = self.agent(no_progress_limit=2, verify=lambda result, state: gaps[result.value])
        model = ScriptedModel(*(ModelResponse(text) for text in
                                ("first", "reordered", "reduced", "regressed", "reduced")))
        outcome = self.run_loop(model, agent=agent)
        self.assertEqual(outcome.result.code, "no_progress")
        self.assertEqual(len(model.inputs), 5)
        self.assertEqual(outcome.context.state.pending, ["a"])

    def test_explicit_incomplete_result_keeps_unresolved_items(self):
        agent = self.agent(no_progress_limit=2,
                           parse=lambda text: Result("incomplete" if text == "blocked" else "completed", text),
                           verify=lambda result, state: ("missing_rule",) if result.status == "completed" else ())
        outcome = self.run_loop(ScriptedModel(ModelResponse("guess"), ModelResponse("blocked")), agent=agent)
        self.assertEqual(outcome.result.status, "incomplete")
        self.assertEqual(outcome.context.state.pending, ["missing_rule"])

    def test_alternating_known_tool_and_completion_gap_cannot_reset_guard(self):
        agent = self.agent(no_progress_limit=2, verify=lambda result, state: ("missing_rule",))
        model = ScriptedModel(tool_call("1"), ModelResponse("猜测"),
                              tool_call("2"), ModelResponse("另一种猜测"), tool_call("3"))
        outcome = self.run_loop(model, agent=agent)
        self.assertEqual(outcome.result.code, "no_progress")
        self.assertEqual(len(model.inputs), 4)

    def test_same_call_id_replay_is_not_new_progress(self):
        handler = Mock(return_value={"found": False})
        model = ScriptedModel(tool_call(), tool_call(), tool_call())
        outcome = self.run_loop(model, handler=handler)
        self.assertEqual(outcome.result.code, "no_progress")
        handler.assert_called_once()
        self.assertEqual(outcome.context.budget.snapshot()["tool_calls"], 3)

    def test_call_id_conflict_observes_the_error_not_the_old_result(self):
        handler = Mock(return_value={"found": True})
        model = ScriptedModel(tool_call(), *(tool_call(arguments='{"q":"changed"}') for _ in range(3)))
        outcome = self.run_loop(model, handler=handler)
        self.assertEqual(outcome.result.code, "no_progress")
        self.assertEqual(len(model.inputs), 4)
        self.assertIn("call_id_conflict", model.inputs[2][-1]["content"])
        handler.assert_called_once()

    def test_repeated_hook_denial_never_executes_the_handler(self):
        handler = Mock()
        hooks = Hooks([Hook("before_tool", lambda event: Decision("deny"), intervention=True)])
        model = ScriptedModel(*(tool_call(str(i)) for i in range(3)))
        runner = Runner(model, [self.agent(no_progress_limit=2)], self.tools(handler), hooks=hooks)
        outcome = runner.run("answer", {"goal": "x"}, self.context())
        self.assertEqual(outcome.result.code, "no_progress")
        handler.assert_not_called()

    def test_no_progress_never_retries_a_previous_action_or_commits(self):
        handler = Mock(return_value={"found": True})
        events = []
        hooks = Hooks([Hook(event, lambda item: events.append(item))
                       for event in ("run_end", "before_commit")])
        model = ScriptedModel(tool_call(), *(ModelResponse("未核对") for _ in range(3)))
        agent = self.agent(no_progress_limit=2, requires_commit=True,
                           verify=lambda result, state: ("missing_rule",))
        runner = Runner(model, [agent], self.tools(handler), hooks=hooks)
        outcome = runner.run("answer", {"goal": "x"}, self.context())
        self.assertEqual(outcome.result.code, "no_progress")
        handler.assert_called_once()
        self.assertIsNone(outcome.context.state.pending_commit)
        self.assertEqual([event["event"] for event in events], ["run_end"])
        self.assertEqual(events[0]["status"], "incomplete")
        callback = Mock()
        with self.assertRaisesRegex(RuntimeFault, "not_pending_commit"):
            runner.commit(outcome, callback)
        callback.assert_not_called()

    def test_hard_budget_and_cancellation_still_take_precedence(self):
        root = self.context(limits=Limits(model_calls=2))
        model = ScriptedModel(tool_call("1"), tool_call("2"), tool_call("3"))
        outcome = self.run_loop(model, context=root)
        self.assertEqual(outcome.result.code, "budget_exhausted")
        root = self.context()

        def cancel(messages, **kwargs):
            root.budget.cancelled.set()
            return tool_call("3")

        model = ScriptedModel(tool_call("1"), tool_call("2"), cancel)
        outcome = self.run_loop(model, context=root)
        self.assertEqual(outcome.result.status, "cancelled")
        self.assertEqual(root.budget.snapshot()["tool_calls"], 2)

    def test_single_and_simple_tool_loop_keep_one_model_call(self):
        for mode in ("single", "tool_loop"):
            model = ScriptedModel(ModelResponse("直接完成"))
            outcome = self.run_loop(model, agent=self.agent(mode=mode))
            self.assertEqual(outcome.result.status, "completed")
            self.assertEqual(len(model.inputs), 1)
            self.assertEqual(outcome.context.budget.snapshot()["tool_calls"], 0)

    def test_guard_is_local_to_each_invocation(self):
        model = ScriptedModel(*(tool_call(str(i)) for i in range(3)), tool_call("fresh"), ModelResponse("完成"))
        runner = Runner(model, [self.agent(no_progress_limit=2)], self.tools())
        first = runner.run("answer", {"goal": "one"}, self.context())
        second = runner.run("answer", {"goal": "two"}, self.context())
        self.assertEqual(first.result.code, "no_progress")
        self.assertEqual(second.result.status, "completed")

    def test_only_envelope_metadata_is_ignored(self):
        first = observation("lookup", {}, {"ok": True, "value": {"id": "item-1"}, "call_id": "1"})
        second = observation("lookup", {}, {"ok": True, "value": {"id": "item-2"}, "call_id": "2"})
        self.assertNotEqual(first, second)

    def test_progress_limit_validation_and_default(self):
        self.assertEqual(self.agent().no_progress_limit, 3)
        for value in (0, 1, -1, True, 2.5, 33):
            with self.subTest(value=value), self.assertRaises(ValueError):
                self.agent(no_progress_limit=value)
        self.assertEqual(replace(self.agent(), no_progress_limit=2).no_progress_limit, 2)
