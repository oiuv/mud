"""The business probe is explicit opt-in and uses bounded synthetic fixtures."""
import io
import json
import unittest
from contextlib import redirect_stdout
from unittest.mock import patch
from unittest.mock import Mock

from ai.scripts import verify_business_agents as probe
from ai.src.world.protocol import manifest_digest, validate_payload
from ai.src.settings import Settings
from ai.tests.test_npc_runtime import completion, reply


class BusinessProbeTests(unittest.TestCase):
    def test_chinese_numbers_are_not_misreported_as_wrong_answers(self):
        for text in ("须贡献至少200，拜师扣除50。", "已有贡献至少二百点，实际扣除五十点。",
                     "门槛两百，入门只扣五十。"):
            self.assertTrue(probe.expected_numbers(text), text)
        self.assertFalse(probe.expected_numbers("至少五十，实际扣除二百。"))

    def test_default_is_dry_run_without_configuration_or_clients(self):
        output = io.StringIO()
        with patch.object(probe, "load_settings") as load, patch.object(probe, "run_cases") as run, redirect_stdout(output):
            self.assertEqual(probe.main([]), 0)
        load.assert_not_called()
        run.assert_not_called()
        self.assertEqual(json.loads(output.getvalue())["max_model_calls"], 7)

    def test_synthetic_world_uses_unchanged_protocol_and_keys(self):
        manifest, payload = probe.world_fixture()
        self.assertEqual(manifest_digest(manifest), payload["manifest_digest"])
        self.assertEqual(validate_payload(payload), payload)

    def test_full_probe_report_serializes_frozen_hooks_without_live_data(self):
        client = Mock()
        client.with_options.return_value = client
        def respond(**kwargs):
            messages = kwargs["messages"]
            guidance = "\n".join(m.get("content") or "" for m in messages
                                 if "已加载专业指导" in (m.get("content") or ""))
            if "conversation-summary" in guidance:
                return completion("旅人计划拜师，目前尚未拜师。")
            if "world-narration" in guidance:
                return completion(json.dumps(dict(schema_version=1, description="松风拂过岩坡，针叶落在旧路旁。",
                                                  used_fact_ids=[])))
            if messages[-1]["role"] == "tool":
                evidence = json.loads(messages[-1]["content"])["value"]["evidence"]
                self.assertTrue(evidence)
                return completion(reply(kind="rules", answer="霞门长老说：须贡献至少200，拜师扣除50。",
                                        claims=[dict(text="门槛200，扣除50", evidence=[evidence[0]["id"]])]))
            return completion(tool="knowledge__search", arguments={"query": "霞门拜师", "threshold": 0})
        client.chat.completions.create.side_effect = respond
        with patch("ai.src.npc.manager.create_chat_client", return_value=client), \
                patch("ai.src.world.generator.create_chat_client", return_value=client):
            report = probe.run_cases(Settings())
        self.assertTrue(json.loads(json.dumps(report))["passed"])
        self.assertEqual(report["model_calls"], 4)
        self.assertEqual(report["total_tokens"], 60)
        self.assertEqual(client.chat.completions.create.call_count, 4)
