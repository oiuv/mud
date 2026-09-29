"""Standalone Skill evaluation uses the real runtime with offline model doubles."""
from contextlib import redirect_stderr, redirect_stdout
from dataclasses import replace
import io
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

from ai.scripts import eval_skill
from src.llm import ModelResponse, ModelUnavailable, ToolCall
from src.settings import Settings


class Model:
    external = False

    def __init__(self, *responses):
        self.responses = iter(responses)
        self.requests = []

    def __call__(self, messages, **options):
        self.requests.append((messages, options))
        response = next(self.responses)
        if isinstance(response, BaseException):
            raise response
        return response


class SkillEvalTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix="skill-eval-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.skills = self.root / "skills"
        pack = self.skills / "example"
        (pack / "references").mkdir(parents=True)
        (pack / "SKILL.md").write_text(
            '---\nname: example\ndescription: 示例技能\nversion: "1"\n'
            'resources: [references/rules.md]\n---\n按输入创作，必要时读参考资料。', encoding="utf-8")
        (pack / "references/rules.md").write_text("贡献门槛为 200，消耗为 50。", encoding="utf-8")
        self.settings = Settings(skills_dir=self.skills, chat_model="offline-model", chat_api_key="private-key")

    def run_case(self, *responses, **options):
        model = Model(*responses)
        report = eval_skill.run_evaluation(model, self.settings, "测试输入", **options)
        return model, report

    def test_single_preloads_guidance_without_model_tools_or_business_data(self):
        model, report = self.run_case(ModelResponse("一株古松立在石隙间。"), skill="example")
        messages, options = model.requests[0]
        self.assertIn("按输入创作", json.dumps(messages, ensure_ascii=False))
        self.assertNotIn("贡献门槛为 200", json.dumps(messages, ensure_ascii=False))
        self.assertEqual(options["tools"], [])
        self.assertEqual(report["status"], "completed")
        self.assertEqual(report["answer"], "一株古松立在石隙间。")
        self.assertEqual(report["usage"]["model_calls"], 1)
        self.assertEqual(report["usage"]["tool_calls"], 1)
        self.assertEqual(report["skills"][0]["version"], "1")
        self.assertEqual(len(report["skills"][0]["hash"]), 64)
        self.assertEqual(report["skills"][0]["loaded_resources"], [])
        self.assertEqual(report["business_validation"], "not_run")
        self.assertTrue(report["human_review_required"])
        self.assertIsNone(report["cost"]["estimated_total_cost"])
        self.assertIsNone(report["cost"]["cost_per_successful_task"])
        self.assertNotIn("private-key", json.dumps(report))
        self.assertEqual([row["event"] for row in report["events"]], ["after_tool", "after_model", "run_end"])

    def test_baseline_needs_no_skill_tree(self):
        self.settings = replace(self.settings, skills_dir=self.root / "missing", source_root=self.root / "missing")
        model, report = self.run_case(ModelResponse("答案"))
        self.assertEqual(report["skills"], [])
        self.assertEqual(report["usage"]["tool_calls"], 0)
        self.assertEqual(model.requests[0][1]["tools"], [])

    def test_resources_use_the_same_tool_and_do_not_grant_other_skills(self):
        model, report = self.run_case(
            ModelResponse(tool_calls=(ToolCall("denied", "skill", '{"name":"other"}'),)),
            ModelResponse(tool_calls=(ToolCall("ref", "skill", '{"name":"example","path":"references/rules.md"}'),)),
            ModelResponse("门槛 200，消耗 50。"), skill="example", mode="tool_loop")
        self.assertEqual([tool["function"]["name"] for tool in model.requests[0][1]["tools"]], ["skill"])
        self.assertIn("skill_denied", json.dumps(model.requests[1][0]))
        self.assertIn("贡献门槛为 200", json.dumps(model.requests[2][0], ensure_ascii=False))
        self.assertEqual(report["skills"][0]["loaded_resources"], ["references/rules.md"])
        self.assertEqual(report["usage"]["model_calls"], 3)

    def test_json_mode_and_format_failure_preserve_original_answer_without_retry(self):
        for text, valid in (('{"description":"松风入耳"}', True), ('```json\n{}\n```', False),
                            ('[1,2]', False), ('{"a":1,"a":2}', False), ("", False)):
            with self.subTest(text=text):
                model, report = self.run_case(ModelResponse(text), json_output=True, mode="tool_loop")
                self.assertTrue(model.requests[0][1]["json_output"])
                self.assertEqual(report["answer"], text)
                self.assertEqual(report["format_valid"], valid)
                self.assertEqual(len(model.requests), 1)

    def test_skill_edit_changes_report_hash_without_runtime_edits(self):
        _, before = self.run_case(ModelResponse("旧版"), skill="example")
        manifest = self.skills / "example/SKILL.md"
        manifest.write_text(manifest.read_text(encoding="utf-8").replace("按输入创作", "写得更加自然"), encoding="utf-8")
        _, after = self.run_case(ModelResponse("新版"), skill="example")
        self.assertNotEqual(before["skills"][0]["hash"], after["skills"][0]["hash"])

    def test_missing_skill_fails_before_model_call(self):
        model, report = self.run_case(skill="missing")
        self.assertEqual(model.requests, [])
        self.assertEqual(report["status"], "failed")
        self.assertEqual(report["code"], "skill_unavailable")

    def test_repository_is_explicit_and_uses_existing_evidence_and_exclusions(self):
        repository = self.root / "repository"
        repository.mkdir()
        (repository / "rule.lpc").write_text("int required = 200;\n", encoding="utf-8")
        (repository / ".env").write_text("KEY=SECRET", encoding="utf-8")
        model, report = self.run_case(
            ModelResponse(tool_calls=(ToolCall("read", "source__read", '{"path":"rule.lpc"}'),)),
            ModelResponse(tool_calls=(ToolCall("secret", "source__read", '{"path":".env"}'),)),
            ModelResponse("需要 200。"), repository=repository, allow_source_egress=True, mode="tool_loop")
        self.assertEqual(report["authorized_tools"], ["source.read", "source.search"])
        self.assertEqual(len(report["evidence"]), 1)
        self.assertEqual(report["evidence"][0]["path"], "rule.lpc")
        self.assertEqual(report["evidence"][0]["origin"], "source.read")
        self.assertIn("file_unavailable", json.dumps(model.requests[2][0]))
        self.assertNotIn("KEY=SECRET", json.dumps([messages for messages, _ in model.requests]))
        for options in ({"mode": "single", "allow_source_egress": True},
                        {"mode": "tool_loop", "allow_source_egress": False}):
            with self.assertRaises(ValueError):
                self.run_case(repository=repository, **options)

    def test_failure_and_cancel_do_not_retry(self):
        for error, status in ((ModelUnavailable("authentication"), "failed"), (KeyboardInterrupt(), "cancelled")):
            with self.subTest(status=status):
                model, report = self.run_case(error)
                self.assertEqual(report["status"], status)
                self.assertEqual(len(model.requests), 1)
                self.assertEqual(report["usage"]["model_calls"], 1)
                self.assertEqual(report["usage"]["usage_incomplete_reports"], 1)

    def test_known_usage_estimates_cost_but_not_cost_per_correct_answer(self):
        self.settings = replace(self.settings, model_prices_per_million={
            "chat:unknown": {"input": 1, "cached_input": 0.5, "output": 2}})
        _, report = self.run_case(ModelResponse("答案", usage={"prompt_tokens": 100, "completion_tokens": 10,
                                                           "cached_prompt_tokens": 20, "total_tokens": 110}))
        self.assertAlmostEqual(report["cost"]["estimated_total_cost"], 0.00011)
        self.assertIsNone(report["cost"]["cost_per_successful_task"])

    def test_shared_adapter_sends_native_json_only_when_requested(self):
        for json_output in (False, True):
            with self.subTest(json_output=json_output):
                client = Mock()
                create = client.with_options.return_value.chat.completions.create
                create.return_value = SimpleNamespace(
                    choices=[SimpleNamespace(finish_reason="stop", message=SimpleNamespace(
                        content='{"answer":"测试"}' if json_output else "测试", tool_calls=[], reasoning_content=None))],
                    usage={"prompt_tokens": 100, "completion_tokens": 10, "total_tokens": 110})
                report = eval_skill.run_evaluation(eval_skill.ChatModel(self.settings, client), self.settings,
                                                   "测试", skill="example", json_output=json_output)
                self.assertEqual(report["status"], "completed")
                self.assertTrue(report["format_valid"])
                self.assertEqual(report["usage"]["usage_reports"], 1)
                self.assertEqual(report["usage"]["usage"]["prompt_tokens"], 100)
                request = create.call_args.kwargs
                if json_output:
                    self.assertEqual(request["response_format"], {"type": "json_object"})
                    self.assertNotIn("max_tokens", request)
                else:
                    self.assertNotIn("response_format", request)
                    self.assertEqual(request["max_tokens"], self.settings.max_tokens)

    def invoke_cli(self, *args):
        stdout, stderr = io.StringIO(), io.StringIO()
        with redirect_stdout(stdout), redirect_stderr(stderr):
            result = eval_skill.main(list(args))
        return result, stdout.getvalue(), stderr.getvalue()

    def test_preview_does_not_create_client_read_sources_or_write_report(self):
        report = self.root / "report.json"
        with patch.object(eval_skill, "load_settings", return_value=self.settings), \
                patch.object(eval_skill, "create_chat_client") as client, \
                patch.object(eval_skill, "load_sources") as sources:
            code, output, _ = self.invoke_cli("--input", "你好", "--skill", "example", "--report", str(report))
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(output)["model_calls"], 0)
        client.assert_not_called()
        sources.assert_not_called()
        self.assertFalse(report.exists())

    def test_cli_model_and_files_are_local_overrides_and_report_cannot_be_overwritten(self):
        report = self.root / "report.json"
        prompt = self.root / "input.txt"
        system = self.root / "system.txt"
        prompt.write_text("自定义输入", encoding="utf-8-sig")
        system.write_text("自定义输出契约", encoding="utf-8")
        fake = Model(ModelResponse('{"answer":"测试"}'))
        client = Mock()
        args = ["--input-file", str(prompt), "--system-file", str(system), "--skill", "example",
                "--model", "other-model", "--json", "--report", str(report), "--execute"]
        with patch.object(eval_skill, "load_settings", return_value=self.settings), \
                patch.object(eval_skill, "create_chat_client", return_value=client) as factory, \
                patch.object(eval_skill, "ChatModel", return_value=fake):
            code, output, _ = self.invoke_cli(*args)
            original = report.read_bytes()
            self.assertEqual(code, 0)
            result = json.loads(output)
            self.assertEqual(result, json.loads(original))
            self.assertEqual(result["model"], "other-model")
            self.assertEqual(result["input"], "自定义输入")
            self.assertEqual(result["system"], "自定义输出契约")
            self.assertEqual(self.settings.chat_model, "offline-model")
            client.close.assert_called_once()
            code, _, _ = self.invoke_cli(*args)
            self.assertEqual(code, 1)
            factory.assert_called_once()
            self.assertEqual(report.read_bytes(), original)

    def test_cli_does_not_enable_source_without_explicit_egress(self):
        with redirect_stderr(io.StringIO()), patch.object(eval_skill, "create_chat_client") as factory:
            with self.assertRaises(SystemExit) as error:
                eval_skill.main(["--input", "问题", "--repository", str(self.root), "--mode", "tool_loop", "--execute"])
        self.assertEqual(error.exception.code, 2)
        factory.assert_not_called()


if __name__ == "__main__":
    unittest.main()
