"""Scripted multi-file investigation; not a benchmark of model reasoning."""
import json
import time
from dataclasses import replace
from types import SimpleNamespace
from unittest.mock import Mock, patch

from ai.src.database import connect
from ai.src.npc.agents import POLICY
from ai.src.npc.investigation import INVESTIGATION, evidence_reference_feedback
from ai.src.npc.manager import NPCManager
from ai.src.npc.service import NPCService
from ai.src.runtime.context import Budget, Limits
from ai.src.runtime.contracts import Contract, RuntimeFault
from ai.src.runtime.hooks import Decision, Hook, Hooks
from ai.src.source_config import load_sources
from ai.tests.test_npc_ai import Fixture
from ai.tests.test_npc_runtime import completion, reply


# Temporary fixture only. Its rules intentionally distinguish gates from costs
# and learning from performance; production has no fixture names or answers.
FILES = {
    "teacher.lpc": '#include "limits.h"\ninherit "base";\n'
                   'int learn(object who) {\n'
                   '    if (!can_learn(who)) return 0;\n'
                   '    if (who->query("contribution") < LEARN_GATE) return 0;\n'
                   '    who->add("contribution", -LEARN_COST);\n'
                   '    return 1;\n}\n',
    "base.lpc": 'int can_learn(object who) {\n'
                '    return who->query_skill("sword") >= 100 || who->query("special_title");\n}\n',
    "limits.h": '#define LEARN_GATE 1000\n#define LEARN_COST 200\n',
    "perform.lpc": 'int perform(object who) {\n'
                   '    if (who->query("neili") < 300) return 0;\n'
                   '    who->add("neili", -50);\n    return 1;\n}\n',
    "mentor.lpc": 'int learn(object who) {\n'
                  '    if (!who->query("old_token")) return 0;\n'
                  '    who->delete("old_token");\n    return 1;\n}\n',
}


class SourceInvestigationTests(Fixture):
    def setUp(self):
        super().setUp()
        self.public = self.root / "public"
        self.public.mkdir()
        for name, content in FILES.items():
            (self.public / name).write_text(content, encoding="utf-8")
        self.settings.source_root = self.public
        self.roles.write_text(json.dumps({"npc": {"name": "侠客"}}), encoding="utf-8")
        self.events = []
        self.calls = 0

    def setup_runtime(self, *hooks):
        knowledge, _ = self.knowledge()
        self.addCleanup(knowledge.close)
        self.client = Mock()
        self.client.with_options.return_value = self.client
        self.manager = NPCManager(settings=self.settings, knowledge=knowledge, client=self.client,
                                  hooks=Hooks([*hooks, Hook("run_end", lambda e: self.events.append(dict(e)))]))
        self.service = NPCService(self.settings, npc_manager=self.manager)
        self.addCleanup(self.service.close)

    def ask(self, **extra):
        return self.service.process_request({**self.request(message="学习与施展分别有什么条件和消耗？"), **extra},
                                            time.monotonic() + 80)

    def persisted(self):
        with connect(self.service.history.db_path) as db:
            return [db.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
                    for table in ("conversations", "player_memories", "request_results")]

    def tool_response(self, *calls):
        self.calls += 1
        result = completion()
        result.choices[0].finish_reason = "tool_calls"
        result.choices[0].message.tool_calls = [
            SimpleNamespace(id=f"step-{self.calls}-{i}", type="function",
                            function=SimpleNamespace(name=name.replace(".", "__"), arguments=json.dumps(args)))
            for i, (name, args) in enumerate(calls)]
        return result

    @staticmethod
    def evidence(kwargs, origin="source.read"):
        records = {}
        for message in kwargs["messages"]:
            if message["role"] != "tool":
                continue
            response = json.loads(message["content"])
            for item in response.get("value", {}).get("evidence", []):
                if item.get("origin") == origin:
                    records[item["path"]] = item
        return records

    def candidate(self, kwargs):
        evidence = self.evidence(kwargs)
        ref = lambda path: evidence[path]["id"]
        return dict(status="completed", kind="rules",
                    parts=[
                        dict(text="侠客说：平常授艺须贡献满一千，学习扣二百；剑法百级或有特许称号皆可。",
                             evidence=[ref("teacher.lpc"), ref("base.lpc"), ref("limits.h")]),
                        dict(text="若持旧令，也可另寻旧师授艺，只收旧令。", evidence=[ref("mentor.lpc")]),
                        dict(text="施展则须内力三百，耗去五十。", evidence=[ref("perform.lpc")]),
                    ], pending=[],
                    investigation=dict(subject="本门绝学的学习与施展", phase="comparison",
                                       entry=[ref("teacher.lpc"), ref("perform.lpc")]))

    def script(self, final=None, after=()):
        final = final or (lambda kwargs: completion(json.dumps(self.candidate(kwargs), ensure_ascii=False)))
        steps = [
            lambda k: self.tool_response(("skill", {"name": "source-investigation"})),
            lambda k: self.tool_response(("source.search", {"query": "learn"})),
            lambda k: self.tool_response(("source.read", {"path": "teacher.lpc", "start": 1, "end": 8})),
            lambda k: self.tool_response(*[("source.read", {"path": path}) for path in FILES if path != "teacher.lpc"]),
            final, *after,
        ]
        self.client.chat.completions.create.side_effect = lambda **kwargs: steps.pop(0)(kwargs)

    @staticmethod
    def unfinished(kwargs):
        return completion(reply("incomplete", answer="侠客说：此事尚有疑处，待我核实后再指点。", pending=["规则尚未核实"]))

    def test_multi_file_claims_commit_with_rechecks_and_replay_without_model(self):
        self.setup_runtime()
        self.script()
        response = self.ask()
        self.assertEqual(response["type"], "chat")
        self.assertIn("贡献满一千，学习扣二百", response["response"])
        self.assertIn("内力三百，耗去五十", response["response"])
        self.assertEqual(self.persisted(), [2, 1, 1])
        event = self.events[-1]
        self.assertEqual(event["status"], "completed")
        self.assertEqual(event["budget"]["model_calls"], 5)
        self.assertEqual(event["budget"]["tool_calls"], 18)  # preload + skill + search + 5 reads + 2*5 rechecks
        self.assertEqual(self.ask(), response)
        self.assertEqual(self.client.chat.completions.create.call_count, 5)
        self.assertNotIn("source:", json.dumps(response))
        self.assertNotIn("teacher.lpc", json.dumps(response))

    def test_npc_uses_unified_exec_and_commits_current_source_evidence(self):
        self.settings.codegraph_enabled = True
        self.settings.codegraph_operations = ("query",)
        (self.public / ".codegraph").mkdir()
        (self.public / ".codegraph/codegraph.db").write_bytes(b"fake index")
        self.setup_runtime()
        def answer(kwargs):
            names = [item["function"]["name"] for item in kwargs["tools"]]
            self.assertEqual(names.count("exec"), 1)
            self.assertNotIn("codegraph__explore", names)
            ref = self.evidence(kwargs)["perform.lpc"]["id"]
            return completion(json.dumps(dict(status="completed", kind="rules",
                parts=[dict(text="侠客说：施展须内力三百，耗去五十。", evidence=[ref])],
                pending=[], investigation=dict(subject="施展要求", phase="perform", entry=[ref])),
                ensure_ascii=False))
        steps = [
            lambda k: self.tool_response(("skill", {"name": "source-investigation"})),
            lambda k: self.tool_response(("exec", {"program": "codegraph", "args": ["query", "perform"]})),
            answer,
        ]
        self.client.chat.completions.create.side_effect = lambda **kwargs: steps.pop(0)(kwargs)
        raw = json.dumps([{"node": {"name": "perform", "kind": "function",
                                  "filePath": "perform.lpc", "startLine": 1, "endLine": 5}}])
        with patch("ai.src.tools.codegraph.run_cli", return_value=raw) as cli:
            response = self.ask(message="施展要多少内力？")
        self.assertEqual(response["type"], "chat", response)
        self.assertIn("内力三百", response["response"])
        self.assertEqual(self.persisted(), [2, 1, 1])
        self.assertEqual(cli.call_count, 1)
        self.assertEqual(self.client.chat.completions.create.call_count, 3)
        self.assertNotIn("source:", json.dumps(response))
        self.assertNotIn("perform.lpc", json.dumps(response))

    def test_read_range_can_support_a_claim_without_loading_whole_file(self):
        (self.public / "teacher.lpc").write_text(FILES["teacher.lpc"] + "\n" * 300, encoding="utf-8")
        self.setup_runtime()
        self.script()
        self.assertEqual(self.ask()["type"], "chat")
        self.assertEqual(self.persisted(), [2, 1, 1])

    def test_public_name_fragment_supports_npc_answer_and_version_rechecks(self):
        dictionary = self.public / "data/e2c_dict.o"
        dictionary.parent.mkdir()
        dictionary.write_text('# names\ndict ([' + '"pad":"字",' * 1500 +
                              '"sword":"基本剑法",])\n', encoding="utf-8")
        self.setup_runtime()
        def read_name(kwargs):
            hit = self.evidence(kwargs, "source.search")["data/e2c_dict.o"]
            return self.tool_response(("source.read", {key: hit[key] for key in
                                      ("path", "start", "end", "start_column", "end_column")}))
        def answer(kwargs):
            evidence = self.evidence(kwargs)
            names = evidence["data/e2c_dict.o"]
            self.assertIn('"sword":"基本剑法"', names["content"])
            self.assertLess(len(names["content"]), 300)
            refs = [evidence["base.lpc"]["id"], names["id"]]
            return completion(json.dumps(dict(status="completed", kind="rules", pending=[],
                parts=[dict(text="侠客说：基本剑法达到一百级，或持有特许称号，这一项便符合。", evidence=refs)],
                investigation=dict(subject="授艺资格", phase="learn", entry=refs[:1])), ensure_ascii=False))
        steps = [lambda k: self.tool_response(("skill", {"name": "source-investigation"})),
                 lambda k: self.tool_response(("source.read", {"path": "base.lpc"}),
                     ("source.search", {"query": "sword", "path_glob": "data/e2c_dict.o"})), read_name, answer]
        self.client.chat.completions.create.side_effect = lambda **kwargs: steps.pop(0)(kwargs)
        response = self.ask(message="只问授艺资格这一项，需要哪门武功？")
        self.assertEqual(response["type"], "chat", response)
        self.assertIn("基本剑法", response["response"])
        self.assertNotIn("data/e2c_dict.o", response["response"])
        self.assertEqual(self.persisted(), [2, 1, 1])

    def test_focused_question_can_finish_without_investigating_unasked_phases(self):
        paths = ("teachers/teacher.lpc", "include/limits.h")
        for path, content in zip(paths, (FILES["teacher.lpc"].replace('"limits.h"', '"../include/limits.h"'),
                                         FILES["limits.h"])):
            file = self.public / path
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(content, encoding="utf-8")
        self.setup_runtime()
        def focused(kwargs):
            evidence = self.evidence(kwargs)
            self.assertEqual(set(evidence), set(paths))
            refs = [evidence[path]["id"] for path in paths]
            return completion(json.dumps(dict(status="completed", kind="rules", pending=[],
                parts=[dict(text="侠客说：按你所说，贡献恰满一千，这一项够了；其他资格仍须另看。", evidence=refs)],
                investigation=dict(subject="当前授艺入口的贡献检查", phase="learn",
                                   entry=[refs[0]])), ensure_ascii=False))
        steps = [
            lambda k: self.tool_response(("skill", {"name": "source-investigation"})),
            lambda k: self.tool_response(*[("source.read", {"path": path}) for path in paths]),
            focused,
        ]
        self.client.chat.completions.create.side_effect = lambda **kwargs: steps.pop(0)(kwargs)
        response = self.ask(message="假设其他资格满足，只问当前授艺入口贡献恰好一千时，这项检查够不够？")
        self.assertEqual(response["type"], "chat")
        self.assertIn("其他资格仍须另看", response["response"])
        self.assertEqual(self.persisted(), [2, 1, 1])
        self.assertEqual(self.events[-1]["status"], "completed")
        self.assertEqual(self.client.chat.completions.create.call_count, 3)
        self.assertEqual(self.events[-1]["budget"]["tool_calls"], 8)  # two reads, both rechecked twice

    def test_missing_entry_still_requires_more_work(self):
        self.setup_runtime()
        def incomplete_check(kwargs):
            candidate = self.candidate(kwargs)
            candidate["investigation"]["entry"] = []
            return completion(json.dumps(candidate))
        self.script(incomplete_check, [self.unfinished])
        self.ask()
        self.assertEqual(self.persisted(), [0, 0, 0])
        self.assertIn("source_entry_required", str(self.client.chat.completions.create.call_args.kwargs["messages"][-1]))

    def test_minimal_contract_keeps_subject_phase_and_entry_without_checklist(self):
        contract = Contract(INVESTIGATION)
        value = dict(subject="贡献检查", phase="learn", entry=["source:entry"])
        self.assertEqual(contract.validate(value), value)
        for field in value:
            with self.subTest(missing=field), self.assertRaises(RuntimeFault):
                contract.validate({key: item for key, item in value.items() if key != field})
        with self.assertRaises(RuntimeFault):
            contract.validate({**value, "checks": []})

    def test_claim_evidence_remains_required_without_checklist(self):
        self.setup_runtime()
        def unsupported(kwargs):
            candidate = self.candidate(kwargs)
            candidate["parts"][0]["evidence"] = []
            return completion(json.dumps(candidate))
        self.script(unsupported, [self.unfinished])
        self.ask()
        self.assertEqual(self.persisted(), [0, 0, 0])
        self.assertIn("contract_violation", str(self.client.chat.completions.create.call_args.kwargs["messages"][-1]))

    def test_search_reference_feedback_identifies_existing_read_without_another_search(self):
        self.setup_runtime()
        references = {}
        def wrong_reference(kwargs):
            candidate = self.candidate(kwargs)
            references["search"] = self.evidence(kwargs, "source.search")["teacher.lpc"]["id"]
            references["read"] = self.evidence(kwargs)["teacher.lpc"]["id"]
            if location == "entry":
                candidate["investigation"]["entry"][0] = references["search"]
            else:
                candidate["parts"][0]["evidence"][0] = references["search"]
            return completion(json.dumps(candidate, ensure_ascii=False))
        def recover(kwargs):
            feedback = kwargs["messages"][-1]["content"]
            self.assertIn("replace_search_reference:" + references["search"] + "->" + references["read"], feedback)
            return completion(json.dumps(self.candidate(kwargs), ensure_ascii=False))
        for location in ("entry", "claim"):
            with self.subTest(location=location):
                self.client.reset_mock()
                self.script(wrong_reference, [recover])
                response = self.ask(request_id=location)
                self.assertEqual(response["type"], "chat")
                self.assertEqual(self.events[-1]["status"], "completed")
                self.assertEqual(self.client.chat.completions.create.call_count, 6)
                self.assertEqual(self.events[-1]["budget"]["tool_calls"], 18)

    def test_unknown_reference_can_be_corrected_using_earlier_reads(self):
        (self.public / "teacher.lpc").write_text(FILES["teacher.lpc"] + "\n" * 300, encoding="utf-8")
        self.setup_runtime()
        invalid_ref = "source:9590dd8355314acc9cce2e1d"
        for location in ("entry", "claim"):
            with self.subTest(location=location):
                self.client.reset_mock()
                persisted_before = self.persisted()
                original = {}
                def wrong_reference(kwargs):
                    candidate = self.candidate(kwargs)
                    original.update(self.evidence(kwargs))
                    self.assertTrue(original["teacher.lpc"]["truncated"])
                    refs = (candidate["investigation"]["entry"] if location == "entry"
                            else candidate["parts"][0]["evidence"])
                    refs[0] = invalid_ref
                    return completion(json.dumps(candidate, ensure_ascii=False))
                def recover(kwargs):
                    self.assertEqual(self.persisted(), persisted_before)
                    feedback = kwargs["messages"][-1]["content"]
                    self.assertIn("unknown_evidence_reference:" + invalid_ref, feedback)
                    self.assertIn("本次请求内较早取得的证据仍可引用", feedback)
                    self.assertIn("不因 truncated 标记而失效", feedback)
                    self.assertEqual(self.evidence(kwargs), original)
                    for item in original.values():
                        self.assertNotIn("unknown_evidence_reference:" + item["id"], feedback)
                        self.assertNotIn("partial_evidence_reference:" + item["id"], feedback)
                    # The model corrects its own citation; no new read is needed.
                    return completion(json.dumps(self.candidate(kwargs), ensure_ascii=False))
                self.script(wrong_reference, [recover])
                self.assertEqual(self.ask(request_id="unknown-" + location)["type"], "chat")
                self.assertEqual(self.events[-1]["status"], "completed")
                self.assertEqual(self.client.chat.completions.create.call_count, 6)
                self.assertEqual(self.events[-1]["budget"]["tool_calls"], 18)

    def test_reference_feedback_is_bounded_and_does_not_guess_replacements(self):
        evidence = {"source:valid": {"id": "source:valid", "origin": "source.read", "truncated": True}}
        before = json.dumps(evidence)
        keys = ["source:valid", "source:vali"] + [f"source:unknown-{n}" for n in range(20)]
        feedback = evidence_reference_feedback(keys, evidence)
        self.assertEqual(len(feedback), 6)  # Five exact references and one shared explanation.
        self.assertEqual(sum(item.startswith("unknown_evidence_reference:") for item in feedback), 5)
        self.assertNotIn("->", str(feedback))
        self.assertEqual(json.dumps(evidence), before)
        self.assertEqual(evidence_reference_feedback(["source:valid"], evidence), [])
        self.assertEqual(evidence_reference_feedback(["source:vali"], evidence)[0],
                         "unknown_evidence_reference:source:vali")

    def test_pending_dependency_prevents_success_without_a_second_checklist(self):
        self.setup_runtime()
        def unresolved(kwargs):
            candidate = self.candidate(kwargs)
            candidate["pending"] = ["影响授艺资格的继承检查尚未核实"]
            return completion(json.dumps(candidate))
        self.script(unresolved, [self.unfinished])
        self.ask()
        self.assertEqual(self.persisted(), [0, 0, 0])
        self.assertIn("unresolved_questions", str(self.client.chat.completions.create.call_args.kwargs["messages"][-1]))

    def test_forged_evidence_and_search_clues_cannot_support_completion(self):
        self.setup_runtime()
        for origin in ("forged", "source.search"):
            def invalid(kwargs):
                candidate = self.candidate(kwargs)
                key = "source:invented" if origin == "forged" else next(iter(self.evidence(kwargs, origin).values()))["id"]
                candidate["investigation"]["entry"] = [key]
                return completion(json.dumps(candidate))
            self.script(invalid, [self.unfinished])
            self.ask(request_id=origin)
            self.assertEqual(self.persisted(), [0, 0, 0])
            self.assertIn("source_read_required", str(self.client.chat.completions.create.call_args.kwargs["messages"][-1]))

    def test_changed_snapshot_is_feedback_not_a_committed_claim(self):
        self.setup_runtime()
        def changed(kwargs):
            candidate = self.candidate(kwargs)
            (self.public / "limits.h").write_text("#define LEARN_GATE 9000\n#define LEARN_COST 900\n", encoding="utf-8")
            return completion(json.dumps(candidate))
        self.script(changed, [self.unfinished])
        self.ask()
        self.assertEqual(self.persisted(), [0, 0, 0])
        self.assertIn("source_recheck:source_changed", str(self.client.chat.completions.create.call_args.kwargs["messages"][-1]))

    def test_changed_file_can_be_reread_and_candidate_repaired(self):
        self.setup_runtime()
        def change(kwargs):
            candidate = self.candidate(kwargs)
            # Non-semantic change still invalidates the old whole-file hash.
            (self.public / "limits.h").write_text(FILES["limits.h"] + "// verified edition\n", encoding="utf-8")
            return completion(json.dumps(candidate))
        self.script(change, [
            lambda k: self.tool_response(("source.read", {"path": "limits.h"})),
            lambda k: completion(json.dumps(self.candidate(k))),
        ])
        self.ask()
        self.assertEqual(self.persisted(), [2, 1, 1])
        self.assertEqual(self.client.chat.completions.create.call_count, 7)

    def test_different_versions_of_same_file_cannot_be_cited_together(self):
        self.setup_runtime()
        original = []
        def change_and_read(kwargs):
            original.append(self.evidence(kwargs)["limits.h"]["id"])
            (self.public / "limits.h").write_text(FILES["limits.h"] + "// new edition\n", encoding="utf-8")
            return self.tool_response(("source.read", {"path": "limits.h"}))
        def mixed(kwargs):
            candidate = self.candidate(kwargs)
            candidate["parts"][0]["evidence"].append(original[0])
            return completion(json.dumps(candidate))
        self.script(change_and_read, [mixed, self.unfinished])
        self.ask()
        self.assertEqual(self.persisted(), [0, 0, 0])
        self.assertIn("source_mixed_versions", str(self.client.chat.completions.create.call_args.kwargs["messages"][-1]))

    def test_verification_hook_cannot_substitute_a_different_valid_snapshot(self):
        def narrow(event):
            if event["call_id"].startswith("verify-"):
                return Decision(changes={"arguments": {"path": "base.lpc"}})
            return Decision()
        self.setup_runtime(Hook("before_tool", narrow, intervention=True))
        self.script(after=[self.unfinished])
        self.ask()
        self.assertEqual(self.persisted(), [0, 0, 0])
        self.assertIn("source_recheck_mismatch", str(self.client.chat.completions.create.call_args.kwargs["messages"][-1]))

    def test_sources_cannot_skip_professional_skill(self):
        self.setup_runtime()
        self.script(after=[self.unfinished])
        original = self.client.chat.completions.create.side_effect
        first = [True]
        def skip(**kwargs):
            result = original(**kwargs)
            if first[0]:
                first[0] = False
                result = original(**kwargs)  # omit source Skill load, keep NPC preload
            return result
        self.client.chat.completions.create.side_effect = skip
        self.ask()
        # A genuine incomplete fallback is allowed; only success requires the Skill.
        self.assertEqual(self.persisted(), [0, 0, 0])
        self.assertEqual(self.events[-1]["status"], "incomplete")
        self.assertIn("source_skill_required", str(self.client.chat.completions.create.call_args.kwargs["messages"][-1]))

    def test_evidence_from_previous_request_cannot_be_reused(self):
        self.setup_runtime()
        prior = []
        def capture(kwargs):
            candidate = self.candidate(kwargs)
            prior.append(candidate["investigation"]["entry"])
            return completion(json.dumps(candidate))
        self.script(capture)
        self.ask()
        def reuse(kwargs):
            candidate = self.candidate(kwargs)
            candidate["investigation"]["entry"] = prior[0]
            return completion(json.dumps(candidate))
        self.script(reuse, [self.unfinished])
        self.ask(request_id="second")
        self.assertEqual(self.persisted(), [2, 1, 1])
        self.assertIn("unknown_evidence", str(self.client.chat.completions.create.call_args.kwargs["messages"][-1]))
        feedback = self.client.chat.completions.create.call_args.kwargs["messages"][-1]["content"]
        for key in prior[0]:
            self.assertIn("unknown_evidence_reference:" + key, feedback)

    def test_change_between_candidate_and_commit_aborts_transaction(self):
        def change(event):
            (self.public / "limits.h").write_text("#define LEARN_GATE 9000\n", encoding="utf-8")
        self.setup_runtime(Hook("before_commit", change))
        self.script()
        self.assertEqual(self.ask()["type"], "error")
        self.assertEqual(self.persisted(), [0, 0, 0])
        self.assertEqual(self.events[-1]["status"], "incomplete")

    def test_repository_defaults_allow_necessary_egress_but_tools_can_be_disabled(self):
        self.setup_runtime()
        self.client.chat.completions.create.side_effect = [
            self.tool_response(("source.read", {"path": "teacher.lpc"})), self.unfinished({})]
        self.ask()
        messages = self.client.chat.completions.create.call_args.kwargs["messages"]
        self.assertTrue(json.loads(messages[-1]["content"])["ok"])
        self.assertEqual(self.persisted(), [0, 0, 0])
        self.assertIn("repository", self.manager.entry_policy("npc").egress_scopes)
        self.settings.runtime_policy = {"tools": ["skill", "knowledge.search"]}
        self.assertNotIn("source.read", self.manager.entry_policy("npc").tools)

    def test_wire_source_grants_do_not_override_global_disable(self):
        self.settings.source_enabled = False
        self.setup_runtime()
        self.client.chat.completions.create.return_value = completion(reply())
        self.ask(source_scopes=["rules"], audience="admin", policy={"tools": ["source.read"]})
        names = {item["function"]["name"] for item in self.client.chat.completions.create.call_args.kwargs["tools"]}
        self.assertNotIn("source__read", names)

    def test_scope_restriction_invalidates_old_authority_cache(self):
        self.setup_runtime()
        self.script()
        self.ask()
        calls = self.client.chat.completions.create.call_count
        other = self.root / "other-repository"
        other.mkdir()
        self.settings.source_root = other
        self.manager.sources = load_sources(self.settings)  # emulate restarted entry policy
        self.assertEqual(self.ask()["type"], "error")
        self.assertEqual(self.client.chat.completions.create.call_count, calls)
        self.assertEqual(self.persisted(), [2, 1, 1])

    def test_simple_chat_does_not_load_investigation_or_add_model_turn(self):
        self.setup_runtime()
        self.client.chat.completions.create.return_value = completion(reply())
        self.ask()
        self.assertEqual(self.client.chat.completions.create.call_count, 1)
        self.assertEqual(self.events[-1]["budget"]["tool_calls"], 1)

    def test_verification_continues_beyond_legacy_tool_budget(self):
        self.setup_runtime()
        original = self.manager.create_context
        def limited(*args):
            return replace(original(*args), budget=Budget(Limits(model_calls=12, tool_calls=8)))
        self.manager.create_context = limited
        self.script()
        self.ask()
        self.assertEqual(self.persisted(), [2, 1, 1])
        self.assertEqual(self.events[-1]["status"], "completed")
        self.assertEqual(self.client.chat.completions.create.call_count, 5)

    def test_parent_cannot_be_broadened_by_role_source_configuration(self):
        self.setup_runtime()
        parent = self.manager.create_context("r", "npc", "alice")
        parent = replace(parent, policy=POLICY)
        child = self.manager.create_context("r", "npc", "alice", parent=parent)
        self.assertNotIn("source.read", child.policy.tools)
        self.assertNotIn("repository", child.policy.scopes)

    def test_legacy_role_scopes_require_explicit_migration(self):
        for names in ([], ["rules"], "rules", ["rules", "rules"], ["../root"], [None]):
            self.roles.write_text(json.dumps({"npc": {"source_scopes": names}}), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "NPC source_scopes is retired"):
                NPCManager(settings=self.settings, knowledge=Mock(), client=Mock())

    def test_player_source_details_are_feedback_then_rewritten_before_commit(self):
        self.setup_runtime()
        def technical(kwargs):
            candidate = self.candidate(kwargs)
            candidate["parts"][0]["text"] += "详情在 teacher.lpc，先看 can_learn()。"
            return completion(json.dumps(candidate))
        self.script(technical, [lambda k: completion(json.dumps(self.candidate(k)))])
        result = self.ask()
        self.assertEqual(self.persisted(), [2, 1, 1])
        self.assertNotIn("teacher.lpc", result["response"])
        self.assertNotIn("can_learn", result["response"])
        self.assertEqual(self.client.chat.completions.create.call_count, 6)
        self.assertIn("unsafe_player_text", str(self.client.chat.completions.create.call_args.kwargs["messages"][-1]))

    def test_actual_denied_dependency_preserves_incomplete_without_reading_it(self):
        (self.public / "base.lpc").rename(self.root / "base.lpc")
        self.setup_runtime()
        steps = [
            lambda k: self.tool_response(("skill", {"name": "source-investigation"})),
            lambda k: self.tool_response(("source.read", {"path": "teacher.lpc"})),
            lambda k: self.tool_response(("source.read", {"path": "base.lpc"})),
            self.unfinished,
        ]
        self.client.chat.completions.create.side_effect = lambda **k: steps.pop(0)(k)
        result = self.ask()
        self.assertEqual(self.events[-1]["status"], "incomplete")
        messages = self.client.chat.completions.create.call_args.kwargs["messages"]
        self.assertEqual(json.loads(messages[-1]["content"])["error"], "file_unavailable")
        self.assertNotIn("can_learn(object", str(messages))
        self.assertNotIn("base.lpc", result["response"])
        self.assertEqual(self.persisted(), [0, 0, 0])

    def test_ambiguous_name_can_request_clarification_with_only_known_entry(self):
        self.setup_runtime()
        def clarify(kwargs):
            candidate = self.candidate(kwargs)
            candidate.update(status="needs_input", parts=[{"text": "侠客说：少侠所问的是哪一门的绝学？"}],
                             pending=["门派尚未明确"])
            return completion(json.dumps(candidate))
        self.script(clarify)
        result = self.ask()
        self.assertEqual(self.events[-1]["status"], "needs_input")
        self.assertIn("哪一门", result["response"])
        self.assertEqual(self.persisted(), [0, 0, 0])

    def test_harmless_inference_does_not_prevent_a_grounded_answer_committing(self):
        self.setup_runtime()
        def answer(kwargs):
            candidate = self.candidate(kwargs)
            candidate["parts"].append({"text": "依我看，师父或许是盼弟子先稳固根基；这只是我的揣测。"})
            return completion(json.dumps(candidate, ensure_ascii=False))
        self.script(answer)
        response = self.ask()
        self.assertEqual(self.events[-1]["status"], "completed")
        self.assertIn("我的揣测", response["response"])
        self.assertEqual(self.persisted(), [2, 1, 1])
        self.assertEqual(self.client.chat.completions.create.call_count, 5)

    def test_hypothetical_resources_do_not_replace_missing_player_state(self):
        self.setup_runtime()
        def answer(kwargs):
            candidate = self.candidate(kwargs)
            candidate.update(status="needs_input", pending=["玩家当前贡献未知"])
            candidate["parts"] = [candidate["parts"][0], {
                "text": "若你现有一千贡献，这一项便够；这只是条件假设。少侠现在有多少贡献？"}]
            return completion(json.dumps(candidate, ensure_ascii=False))
        self.script(answer)
        response = self.ask(message="我的贡献现在够请教吗？")
        self.assertEqual(self.events[-1]["status"], "needs_input")
        self.assertIn("条件假设", response["response"])
        self.assertEqual(self.persisted(), [0, 0, 0])
        self.assertEqual(self.client.chat.completions.create.call_count, 5)

    def test_unavailable_definition_can_deliver_grounded_partial_answer(self):
        (self.public / "base.lpc").rename(self.root / "base.lpc")
        self.setup_runtime()
        def partial(kwargs):
            messages = kwargs["messages"]
            observed = [json.loads(message["content"]) for message in messages if message["role"] == "tool"]
            self.assertTrue(any(item.get("error") == "file_unavailable" for item in observed))
            self.assertEqual(observed[-1]["value"]["evidence"], [])
            self.assertFalse(observed[-1]["value"]["truncated"])
            evidence = self.evidence(kwargs)
            self.assertEqual(set(evidence), {"teacher.lpc"})
            entry = evidence["teacher.lpc"]["id"]
            return completion(json.dumps(dict(status="incomplete", kind="rules",
                parts=[dict(text="侠客说：授艺前要先核查入门资格；究竟如何判定，我尚未核实，暂不能断言你能否通过。",
                            evidence=[entry]),
                       dict(text="依我推测，也许要兼看根基与心法，不过这只是揣测，合算之法还须查证。")],
                pending=["资格判定实现不可取得，无法确认所需修为。"],
                investigation=dict(subject="授艺资格的判定", phase="learn", entry=[entry])), ensure_ascii=False))
        steps = [
            lambda k: self.tool_response(("skill", {"name": "source-investigation"})),
            lambda k: self.tool_response(("source.read", {"path": "teacher.lpc"})),
            lambda k: self.tool_response(("source.read", {"path": "base.lpc"})),
            lambda k: self.tool_response(("source.search", {"query": "int can_learn"})),
            partial,
        ]
        self.client.chat.completions.create.side_effect = lambda **k: steps.pop(0)(k)
        response = self.ask(message="只问授艺资格如何判定，我的修为能通过吗？")
        self.assertEqual(self.events[-1]["status"], "incomplete")
        self.assertIn("暂不能断言", response["response"])
        self.assertIn("这只是揣测", response["response"])
        self.assertNotIn("teacher.lpc", response["response"])
        self.assertNotIn("can_learn(object", str(self.client.chat.completions.create.call_args))
        self.assertEqual(self.client.chat.completions.create.call_count, 5)
        self.assertEqual(self.events[-1]["budget"]["tool_calls"], 6)  # includes the cited file recheck
        self.assertEqual(self.persisted(), [0, 0, 0])

    def compact_investigation(self, *, change=False):
        self.settings.context_window_tokens = 64000
        self.settings.max_tokens = 2048
        self.settings.model_max_output_tokens = 8192
        for name in ("scenery-a.lpc", "scenery-b.lpc"):
            (self.public / name).write_text(("// scenery " + "mist " * 43 + "\n") * 90, encoding="utf-8")
        compact_calls, saved = [], []
        self.setup_runtime(Hook("after_model", lambda e: compact_calls.append(dict(e))
                                if e.get("operation") == "compact" else None))
        def save_and_read(kwargs):
            saved.append(self.candidate(kwargs))
            return self.tool_response(("source.read", {"path": "scenery-a.lpc", "end": 100}))
        self.script(save_and_read, [
            lambda k: self.tool_response(("source.read", {"path": "scenery-b.lpc", "end": 100})),
            lambda k: completion(json.dumps(saved[0])),
            self.unfinished,
        ])
        scripted = self.client.chat.completions.create.side_effect
        def respond(**kwargs):
            if kwargs["messages"][0]["content"].startswith("# 上下文压缩"):
                if change:
                    (self.public / "limits.h").write_text("#define LEARN_GATE 9000\n#define LEARN_COST 900\n", encoding="utf-8")
                result = completion("已核对学习贡献门槛1000、扣除200，施展内力门槛300、消耗50；旧令是另一授艺路径。")
            else:
                result = scripted(**kwargs)
            result.usage = None  # no synthetic tiny input anchor hiding a large context
            return result
        self.client.chat.completions.create.side_effect = respond
        response = self.ask()
        self.assertTrue(compact_calls, "must exercise actual runtime compact, not a mocked history replacement")
        return response

    def test_source_citations_and_conditions_survive_actual_compact_and_commit(self):
        response = self.compact_investigation()
        self.assertEqual(self.persisted(), [2, 1, 1])
        self.assertEqual(self.events[-1]["status"], "completed")
        for text in ("贡献满一千，学习扣二百", "剑法百级或有特许称号", "内力三百，耗去五十", "只收旧令"):
            self.assertIn(text, response["response"])

    def test_changed_source_after_compact_cannot_be_saved_from_an_old_summary(self):
        self.compact_investigation(change=True)
        self.assertEqual(self.persisted(), [0, 0, 0])
        self.assertEqual(self.events[-1]["status"], "incomplete")
        self.assertIn("source_recheck:source_changed", str(self.client.chat.completions.create.call_args.kwargs["messages"][-1]))
