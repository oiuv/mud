"""One skill tool, permission-filtered discovery and immutable run snapshots."""
import json
import tempfile
from dataclasses import replace
from pathlib import Path

from ai.src.llm import ModelResponse, ToolCall
from ai.src.runtime.context import Limits, Policy
from ai.src.runtime.contracts import RuntimeFault
from ai.src.runtime.runner import Runner
from ai.src.runtime.skills import Skills
from ai.src.runtime.tools import Tools
from ai.tests.test_runtime import RuntimeFixture, ScriptedModel


class SkillTests(RuntimeFixture):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.pack("first", "FIRST_GUIDANCE", resources={"references/example.md": "EXAMPLE"})
        self.pack("second", "SECOND_GUIDANCE")
        self.pack("hidden", "PRIVATE_GUIDANCE")
        self.policy = Policy(tools={"skill", "lookup"}, skills={"first", "second"}, agents={"answer"})

    def pack(self, name, body="GUIDANCE", *, resources=None, allowed=None):
        metadata = {"name": name, "description": f"Use {name} for its specialty", "version": "1"}
        if resources:
            metadata["resources"] = list(resources)
        if allowed is not None:
            metadata["allowed-tools"] = allowed
        directory = self.root / name
        directory.mkdir(exist_ok=True)
        (directory / "SKILL.md").write_text("---\n" + json.dumps(metadata) + "\n---\n" + body, encoding="utf-8")
        for relative, value in (resources or {}).items():
            path = directory / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(value, encoding="utf-8")

    def assembly(self, model=None, **agent_options):
        skills = Skills(self.root)
        tools = Tools()
        tools.discover("ai.src.tools", {"skills": skills})
        runner = Runner(model or ScriptedModel(ModelResponse("answer")),
                        [self.agent(policy=self.policy, **agent_options)], tools, skills=skills)
        return runner, skills, self.context(policy=self.policy)

    def test_multiple_skills_share_exactly_one_tool(self):
        runner, _, context = self.assembly()
        self.assertEqual([item["function"]["name"] for item in runner.tools.definitions(context)], ["skill"])
        for index, name in enumerate(("first", "second")):
            reply = runner.tools.execute("skill", {"name": name}, context, str(index))
            self.assertTrue(reply["ok"])
            self.assertEqual(reply["value"]["name"], name)

    def test_catalog_is_filtered_metadata_not_full_guidance(self):
        model = ScriptedModel(ModelResponse("answer"))
        runner, _, context = self.assembly(model)
        self.assertEqual(runner.run("answer", {"goal": "x"}, context).result.status, "completed")
        prompt = json.dumps(model.inputs)
        self.assertIn("Use first for its specialty", prompt)
        self.assertIn("Use second for its specialty", prompt)
        for hidden in ("hidden", "FIRST_GUIDANCE", "SECOND_GUIDANCE", "PRIVATE_GUIDANCE", "EXAMPLE"):
            self.assertNotIn(hidden, prompt)

    def test_new_package_requires_no_dispatch_branch(self):
        self.pack("third", "NEW_GUIDANCE")
        self.policy = replace(self.policy, skills={"third"})
        runner, skills, context = self.assembly()
        self.assertIn("third", skills.catalog_message(context)["content"])
        self.assertEqual(len(runner.tools.definitions(context)), 1)
        self.assertEqual(runner.tools.execute("skill", {"name": "third"}, context, "new")["value"]["guidance"], "NEW_GUIDANCE")

    def test_discovery_is_not_authorization(self):
        runner, _, context = self.assembly()
        reply = runner.tools.execute("skill", {"name": "hidden"}, context, "denied")
        self.assertEqual(reply["error"], "skill_denied")
        self.assertNotIn("PRIVATE", str(reply))

    def test_no_actions_or_legacy_entrypoints(self):
        runner, _, context = self.assembly()
        self.assertEqual(runner.tools.execute("skill", {"action": "load", "name": "first"}, context, "action")["error"],
                         "contract_violation")
        for index, name in enumerate(("skill.list", "skill.load", "skill.read_resource")):
            self.assertEqual(runner.tools.execute(name, {}, context, str(index))["error"], "unknown_tool")

    def test_model_loads_body_then_resource_through_same_tool(self):
        model = ScriptedModel(
            ModelResponse(tool_calls=(ToolCall("body", "skill", '{"name":"first"}'),)),
            ModelResponse(tool_calls=(ToolCall("resource", "skill", '{"name":"first","path":"references/example.md"}'),)),
            ModelResponse("finished"))
        runner, _, context = self.assembly(model)
        result = runner.run("answer", {"goal": "x"}, context)
        self.assertEqual(result.result.status, "completed")
        self.assertNotIn("FIRST_GUIDANCE", str(model.inputs[0]))
        self.assertIn("FIRST_GUIDANCE", str(model.inputs[1]))
        self.assertNotIn("EXAMPLE", str(model.inputs[1]))
        self.assertIn("EXAMPLE", str(model.inputs[2]))
        self.assertIn("references/example.md", result.context.state.skills["first"]["loaded_resources"])

    def test_direct_preload_uses_tool_without_extra_model_turn(self):
        model = ScriptedModel(ModelResponse("finished"))
        runner, _, context = self.assembly(model, mode="single", required_skills=("first",))
        result = runner.run("answer", {"goal": "x"}, context)
        self.assertEqual(result.result.status, "completed")
        self.assertIn("FIRST_GUIDANCE", str(model.inputs[0]))
        self.assertEqual(context.budget.counts["model_calls"], 1)
        self.assertEqual(context.budget.counts["tool_calls"], 1)

    def test_disabled_tool_hides_catalog_and_blocks_preload(self):
        self.policy = replace(self.policy, tools=set())
        model = ScriptedModel(ModelResponse("without skills"))
        runner, skills, context = self.assembly(model)
        self.assertEqual(runner.run("answer", {"goal": "x"}, context).result.status, "completed")
        self.assertNotIn("Use first", str(model.inputs))
        with self.assertRaises(RuntimeFault):
            skills.load(context, {"name": "first"})
        model = ScriptedModel()
        runner, _, context = self.assembly(model, required_skills=("first",))
        self.assertEqual(runner.run("answer", {"goal": "x"}, context).result.code, "tool_denied")
        self.assertEqual(model.inputs, [])

    def test_missing_registered_tool_also_hides_catalog(self):
        model = ScriptedModel(ModelResponse("answer"))
        runner = Runner(model, [self.agent(policy=self.policy)], skills=Skills(self.root))
        runner.run("answer", {"goal": "x"}, self.context(policy=self.policy))
        self.assertNotIn("Use first", str(model.inputs))

    def test_skill_tool_ceilings_only_shrink(self):
        self.pack("first", allowed=["lookup", "skill", "execute"])
        self.pack("second", allowed=["lookup", "execute"])
        runner, skills, context = self.assembly()
        self.assertTrue(runner.tools.execute("skill", {"name": "first"}, context, "first")["ok"])
        self.assertEqual(context.state.tool_ceiling, {"skill", "lookup"})
        self.assertTrue(runner.tools.execute("skill", {"name": "second"}, context, "second")["ok"])
        self.assertEqual(context.state.tool_ceiling, {"lookup"})
        self.assertEqual(runner.tools.definitions(context), [])
        with self.assertRaises(RuntimeFault):
            skills.catalog_message(context)

    def test_malformed_optional_package_does_not_break_other_skills(self):
        (self.root / "second" / "SKILL.md").write_text("not a manifest", encoding="utf-8")
        runner, skills, context = self.assembly()
        catalog = skills.catalog_message(context)["content"]
        self.assertIn("first", catalog)
        self.assertNotIn("second", catalog)
        self.assertTrue(runner.tools.execute("skill", {"name": "first"}, context, "ok")["ok"])
        self.assertEqual(runner.tools.execute("skill", {"name": "second"}, context, "bad")["error"], "skill_unavailable")

    def test_required_missing_skill_fails_without_model_fallback(self):
        model = ScriptedModel()
        runner, _, context = self.assembly(model, required_skills=("missing",))
        self.assertEqual(runner.run("answer", {"goal": "x"}, context).result.code, "skill_denied")
        self.assertEqual(model.inputs, [])

    def test_catalog_pins_body_for_entire_run(self):
        runner, skills, context = self.assembly()
        skills.catalog_message(context)
        self.pack("first", "CHANGED_GUIDANCE")
        first = runner.tools.execute("skill", {"name": "first"}, context, "old")["value"]
        self.assertEqual(first["guidance"], "FIRST_GUIDANCE")
        new = runner.tools.execute("skill", {"name": "first"}, self.context(policy=self.policy), "new")["value"]
        self.assertEqual(new["guidance"], "CHANGED_GUIDANCE")
        self.assertNotEqual(first["hash"], new["hash"])

    def test_resource_change_rejected_unless_already_safely_cached(self):
        runner, skills, context = self.assembly()
        skills.catalog_message(context)
        path = self.root / "first" / "references" / "example.md"
        path.write_text("NEW", encoding="utf-8")
        args = {"name": "first", "path": "references/example.md"}
        self.assertEqual(runner.tools.execute("skill", args, context, "changed")["error"], "skill_changed")
        fresh = self.context(policy=self.policy)
        self.assertEqual(runner.tools.execute("skill", args, fresh, "one")["value"]["content"], "NEW")
        path.write_text("LATER", encoding="utf-8")
        self.assertEqual(runner.tools.execute("skill", args, fresh, "two")["value"]["content"], "NEW")

    def test_resource_must_be_declared_and_stay_in_package(self):
        runner, _, context = self.assembly()
        for index, path in enumerate(("../hidden/SKILL.md", "SKILL.md", "C:/private.txt", "scripts/run.py",
                                      "references/missing.md")):
            reply = runner.tools.execute("skill", {"name": "first", "path": path}, context, str(index))
            self.assertEqual(reply["error"], "skill_resource_denied")

    def test_scripts_in_metadata_are_never_executed(self):
        self.pack("first", resources={"scripts/run.py": "raise AssertionError('must not run')"})
        runner, _, context = self.assembly()
        self.assertEqual(runner.tools.execute("skill", {"name": "first"}, context, "script")["error"], "skill_unavailable")

    def test_developer_skill_roots_are_rejected(self):
        for name in (".agents", ".codex", ".claude"):
            with self.assertRaises(ValueError):
                Skills(self.root / name / "skills")

    def test_oversized_body_or_resource_is_not_silently_truncated(self):
        for body, resources in (("x" * 33000, None), ("body", {"references/large.md": "x" * 33000})):
            with self.subTest(resource=bool(resources)):
                self.pack("first", body, resources=resources)
                model = ScriptedModel()
                runner, _, context = self.assembly(model, required_skills=("first",))
                outcome = runner.run("answer", {"goal": "x"}, context)
                self.assertEqual(outcome.result.code, "skill_unavailable")
                self.assertEqual(model.inputs, [])

    def test_preload_obeys_context_limit_and_never_sends_partial_guidance(self):
        model = ScriptedModel()
        runner, _, context = self.assembly(model, required_skills=("first",), limits=Limits(context_bytes=64))
        result = runner.run("answer", {"goal": "x"}, context)
        self.assertEqual(result.result.status, "incomplete")
        self.assertEqual(model.inputs, [])
