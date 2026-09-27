"""One model-authored answer, projected without rewriting any factual text."""
import json
import unittest

from ai.src.agents.router import OUTPUT
from ai.src.npc.agents import build_agents, parse_reply
from ai.src.runtime.contracts import RuntimeFault
from ai.src.settings import Settings


class AnswerPartsTests(unittest.TestCase):
    def parse(self, parts, **changes):
        value = dict(status="completed", kind="rules", parts=parts, pending=[])
        value.update(changes)
        return parse_reply(json.dumps(value, ensure_ascii=False))

    def npc_contract(self):
        return next(build_agents(Settings())).outputs

    def test_words_numbers_order_and_narration_are_preserved(self):
        parts = [
            {"text": "侠客微笑道："},
            {"text": "门槛为 60，实际扣除 30；甲或乙满足其一即可。", "evidence": ["source:gate", "source:cost"]},
            {"text": "  此项够用，仍须另看其他条件。\n切莫莽撞。", "evidence": ["knowledge:rules"]},
            {"text": "晚风拂过竹梢，他抬手邀你坐下。"},
        ]
        result = self.parse(parts)
        self.assertEqual(result.value["answer"], "\n".join(part["text"] for part in parts))
        self.assertEqual(result.value["claims"], parts[1:3])
        self.assertNotIn("parts", result.value)
        self.assertEqual(self.npc_contract().validate(result.value), result.value)
        for claim in result.value["claims"]:
            self.assertIn(claim["text"], result.value["answer"])
        self.assertNotIn("source:", result.value["answer"])

    def test_conversation_needs_input_and_incomplete_do_not_invent_claims(self):
        for status in ("completed", "needs_input", "incomplete"):
            with self.subTest(status=status):
                pending = [] if status == "completed" else ["尚缺信息"]
                result = self.parse([{"text": "侠客说：少侠慢慢道来。"}], status=status,
                                    kind="conversation", pending=pending)
                self.assertEqual(result.status, status)
                self.assertEqual(result.value["claims"], [])
                self.assertEqual(result.value["pending"], pending)
                self.npc_contract().validate(result.value)

    def test_partial_answer_keeps_same_evidence_and_unresolved_question(self):
        investigation = {"subject": "入门", "phase": "learn", "entry": ["source:entry"]}
        result = self.parse([
            {"text": "侠客说：入门先考校根基。", "evidence": ["source:entry"]},
            {"text": "如何考校尚未查明，我暂不能断言你已够格。"},
        ], status="incomplete", investigation=investigation, pending=["资格计算尚未查明"])
        self.assertEqual(result.value["investigation"], investigation)
        self.assertEqual(result.value["claims"][0]["text"], "侠客说：入门先考校根基。")
        self.assertEqual(result.value["pending"], ["资格计算尚未查明"])

    def test_duplicate_answer_or_claims_are_rejected_not_silently_selected(self):
        for extra in ({"answer": "错误的另一份答案"}, {"claims": []}):
            with self.subTest(extra=extra), self.assertRaises(RuntimeFault) as raised:
                self.parse([{"text": "侠客说：少侠有礼。"}], **extra)
            self.assertEqual(raised.exception.code, "single_answer_required")

    def test_qualified_inference_is_delivered_without_becoming_a_verified_claim(self):
        known = {"text": "侠客说：授艺前会考校你的修为。", "evidence": ["source:entry"]}
        inference = {"text": "我推测可能兼看根基与心法，但合算之法还未查明，暂不能断言够格。"}
        result = self.parse([known, inference], status="incomplete", pending=["合算之法未核实"])
        self.assertEqual(result.value["answer"], known["text"] + "\n" + inference["text"])
        self.assertEqual(result.value["claims"], [known])
        self.assertEqual(result.value["pending"], ["合算之法未核实"])
        self.npc_contract().validate(result.value)
        OUTPUT.validate(result.value)

    def test_qualifier_does_not_turn_false_text_into_verified_truth(self):
        # The projection has no semantic classifier: even uncited misleading
        # prose reaches the reviewer and cannot be hidden by omitting evidence.
        text = "侠客说：虽是推测，你却一定能通过所有考验。"
        result = self.parse([{"text": text}], status="incomplete", pending=["考验未核实"])
        self.assertEqual(result.value["answer"], text)
        self.assertEqual(result.value["claims"], [])

    def test_parts_are_required_and_declared_evidence_cannot_be_empty(self):
        with self.assertRaises(RuntimeFault) as raised:
            parse_reply('{"status":"completed","kind":"conversation","pending":[]}')
        self.assertEqual(raised.exception.code, "answer_parts_required")
        for parts in (None, "text", [{"text": ""}], [{"text": 42}],
                      [{"text": "规则", "evidence": []}], [{"text": "规则", "evidence": [""]}],
                      [{"text": "规则", "evidence": "source:x"}], [{"text": "规则", "secret": "x"}]):
            with self.subTest(parts=parts), self.assertRaises(RuntimeFault):
                self.parse(parts)

    def test_existing_business_limits_apply_to_combined_prose(self):
        contract = self.npc_contract()
        long_paragraph = self.parse([{"text": "侠客说：" + "山" * 1200, "evidence": ["source:x"]}])
        contract.validate(long_paragraph.value)  # No separate shorter internal-claim limit.
        oversized = self.parse([{"text": "山" * 900}, {"text": "水" * 900}])
        with self.assertRaises(RuntimeFault):
            contract.validate(oversized.value)
        with self.assertRaises(RuntimeFault):
            self.parse([{"text": "山"}] * 21)

    def test_original_delivery_has_no_rewritten_body(self):
        result = self.parse([], result_ref="result:" + "a" * 32)
        OUTPUT.validate(result.value)
        self.assertEqual(result.value["answer"], "")
        self.assertEqual(result.value["claims"], [])
        with self.assertRaises(RuntimeFault):
            self.npc_contract().validate(result.value)

    def test_json_projection_does_not_claim_to_correct_wrong_facts(self):
        result = self.parse([{"text": "侠客说：八十除以二再加四十等于一百。", "evidence": ["source:x"]}])
        self.assertEqual(result.value["answer"], result.value["claims"][0]["text"])
        # Semantic quality still requires comparing the statement to its source.
        self.assertIn("等于一百", result.value["answer"])


if __name__ == "__main__":
    unittest.main()
