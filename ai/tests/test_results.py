"""Artifact provenance, original delivery, expiry and committed-cache replay."""
import json
from dataclasses import replace

from ai.src.llm import ModelResponse
from ai.src.runtime.context import Policy
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.results import Results
from ai.src.runtime.runner import Runner
from ai.tests.test_runtime import RuntimeFixture, ScriptedModel


class ResultTests(RuntimeFixture):
    def settled(self, text="original result", *, commit=True, context=None):
        root = context or self.context()
        runner = Runner(ScriptedModel(ModelResponse(text)), [self.agent(requires_commit=True)])
        outcome = runner.run("answer", {"goal": "original delivery"}, root)
        if commit:
            runner.commit(outcome, lambda value: value)
        return root, runner, outcome

    def test_original_result_is_not_rewritten_or_generated_again(self):
        text = "门槛 60，扣除 30。\n持剑时方可施展；另有例外，不能省略。"
        root, runner, outcome = self.settled(text)
        ref = root.results.publish(outcome)
        self.assertEqual(root.results.resolve(ref, root)["value"], text)
        self.assertEqual(root.results.publish(outcome), ref)
        self.assertEqual(root.budget.counts["model_calls"], 1)
        self.assertEqual(len(runner.model.inputs), 1)

    def test_pending_candidate_and_failed_commit_cannot_be_published(self):
        root, runner, outcome = self.settled(commit=False)
        with self.assertRaisesRegex(RuntimeFault, "result_not_committed"):
            root.results.publish(outcome)
        def fail(value):
            raise OSError("fixture failure")
        with self.assertRaisesRegex(RuntimeFault, "commit_failed"):
            runner.commit(outcome, fail)
        with self.assertRaisesRegex(RuntimeFault, "result_not_committed"):
            root.results.publish(outcome)

    def test_root_session_audience_and_authority_checks(self):
        root, _, outcome = self.settled()
        ref = root.results.publish(outcome)
        for context in (self.context(), replace(root, actor="other"), replace(root, audience="admin"),
                        replace(root, session="other"), replace(root, policy=Policy(agents={"answer"}))):
            with self.subTest(context=context.actor), self.assertRaisesRegex(RuntimeFault, "result_denied"):
                root.results.resolve(ref, context)
        with self.assertRaisesRegex(RuntimeFault, "result_expired"):
            root.results.resolve("result:" + "f" * 32, root)

    def test_cancel_and_closed_request_cannot_deliver_a_reference(self):
        root, _, outcome = self.settled()
        ref = root.results.publish(outcome)
        root.budget.cancelled.set()
        with self.assertRaisesRegex(RuntimeFault, "cancelled"):
            root.results.resolve(ref, root)
        other, _, other_outcome = self.settled()
        other_ref = other.results.publish(other_outcome)
        other.results.close()
        with self.assertRaisesRegex(RuntimeFault, "result_expired"):
            other.results.resolve(other_ref, other)

    def test_bounded_retention_expires_old_reference_without_ending_task(self):
        root = replace(self.context(), results=Results(max_items=1))
        _, _, first = self.settled("first", context=root)
        old = root.results.publish(first)
        _, _, second = self.settled("second", context=root)
        new = root.results.publish(second)
        with self.assertRaisesRegex(RuntimeFault, "result_expired"):
            root.results.resolve(old, root)
        self.assertEqual(root.results.resolve(new, root)["value"], "second")
        self.assertFalse(root.budget.cancelled.is_set())

    def test_oversized_or_mutated_result_never_delivered(self):
        root, _, outcome = self.settled("large output")
        small = Results(max_bytes=4)
        with self.assertRaisesRegex(RuntimeFault, "result_too_large"):
            small.publish(outcome)
        ref = root.results.publish(outcome)
        root.results._records[ref] = replace(root.results._records[ref], encoded='{"value":"tampered"}')
        with self.assertRaisesRegex(RuntimeFault, "result_changed"):
            root.results.resolve(ref, root)

    def test_settled_candidate_cannot_be_changed_before_publication(self):
        root, _, outcome = self.settled("original")
        object.__setattr__(outcome.result, "value", "changed after settlement")
        with self.assertRaisesRegex(RuntimeFault, "result_changed"):
            root.results.publish(outcome)

    def test_cache_projection_retains_only_cited_provenance(self):
        value = {"answer": "requires 60", "claims": [{"text": "requires 60", "evidence": ["one"]}]}
        packed = Results.pack(value, {"one": {"id": "one", "path": "public.lpc", "hash": "abc",
                                             "content": "raw research not for parent"},
                                     "unused": {"id": "unused", "content": "other research"}})
        record = json.loads(packed)
        self.assertEqual(set(record["evidence"]), {"one"})
        self.assertNotIn("content", record["evidence"]["one"])
        self.assertEqual(record["value"], value)
        with self.assertRaisesRegex(RuntimeFault, "invalid_result_evidence"):
            Results.pack(value, {})
