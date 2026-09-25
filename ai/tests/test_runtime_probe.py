"""Probe accounting and assertions are tested without enabling live calls."""
from ai.scripts.verify_runtime import run_cases
from ai.src.llm import ModelResponse, ToolCall
from ai.tests.test_runtime import RuntimeFixture, ScriptedModel


class ProbeTests(RuntimeFixture):
    def test_both_probe_paths_and_total_budget(self):
        model = ScriptedModel(
            ModelResponse(tool_calls=(ToolCall("one", "skill", '{"name":"test-ritual"}'),)),
            ModelResponse(tool_calls=(ToolCall("two", "skill", '{"name":"test-ritual","path":"references/rules.md"}'),)),
            ModelResponse('{"required":200,"spent":50}'),
            ModelResponse('{"required":200,"spent":50}'))
        # The CLI imports its independently deployable src namespace. Adapt only the
        # response type for this test, not the production protocol or model behavior.
        from src.llm import ModelResponse as Response, ToolCall as Call
        def adapter(*args, **kwargs):
            reply = model(*args, **kwargs)
            return Response(reply.text, tuple(Call(c.id, c.name, c.arguments) for c in reply.tool_calls))
        report = run_cases(adapter, "fake")
        self.assertTrue(report["passed"])
        self.assertEqual(report["total"]["model_calls"], 4)
        self.assertEqual(report["total"]["tool_calls"], 3)

    def test_answer_without_loading_required_evidence_does_not_pass(self):
        from src.llm import ModelResponse as Response
        report = run_cases(lambda *a, **kw: Response('{"required":200,"spent":50}'), "fake")
        self.assertFalse(report["passed"])
        self.assertFalse(report["cases"][0]["passed"])
