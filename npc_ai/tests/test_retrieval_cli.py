"""Exercise the real retrieval CLI with isolated data and no external API calls."""
from contextlib import redirect_stderr, redirect_stdout
from dataclasses import replace
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from unittest.mock import Mock, patch

from npc_ai.scripts import test_retrieval as cli
from npc_ai.tests.test_npc_ai import Fixture


SCRIPT = Path(cli.__file__).resolve()


class RetrievalCLITests(Fixture):
    def setUp(self):
        super().setUp()
        self.corpus()
        self.roles.write_text(json.dumps({
            "npc": {"knowledge_threshold": 0.8},
            "disabled": {"knowledge_threshold": 1},
        }), encoding="utf-8")
        self.env = dict(os.environ, DATA_DIR=str(self.settings.data_dir),
                        HELP_DIR=str(self.help), NPC_ROLES_FILE=str(self.roles),
                        DASHSCOPE_API_KEY="", OPENAI_API_KEY="", PYTHONUTF8="1",
                        RETRIEVAL_TOP_K="3", MAX_MESSAGE_CHARS="1000",
                        CHUNK_SIZE="3000", CHUNK_OVERLAP="200")

    def run_cli(self, *args, input=None):
        return subprocess.run(
            [sys.executable, "-X", "utf8", str(SCRIPT), *args],
            input=input, capture_output=True, text=True, encoding="utf-8",
            cwd=self.root, env=self.env, timeout=30,
        )

    def test_single_question_shows_retrieved_content(self):
        result = self.run_cli("武当派如何拜师？", "--bm25", "--top-k", "1")
        self.assertEqual(result.returncode, 0, result.stderr)
        for text in ("召回 1 条", "[1] 武当派", "文件：wudang", "文档块：",
                     "召回来源：BM25", "分数：BM25=", "找到张三丰"):
            self.assertIn(text, result.stdout)
        self.assertNotIn("分数：RRF=", result.stdout)
        self.assertNotIn("[2]", result.stdout)

    def test_interactive_questions_blank_input_and_exit(self):
        result = self.run_cli("--bm25", "--top-k", "1",
                              input="\n武当派如何拜师？\n少林派有什么武功？\n/quit\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.count("问题："), 2)
        self.assertIn("文件：wudang", result.stdout)
        self.assertIn("文件：shaolin", result.stdout)

    def test_interactive_rejects_long_question_and_continues_until_eof(self):
        result = self.run_cli("--bm25", input="字" * 1001 + "\n武当拜师\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("最多 1000 字符", result.stderr)
        self.assertIn("文件：wudang", result.stdout)

    def test_preview_and_full_document_chunk(self):
        content = "武当剑法" * 180 + "末尾验证标记"
        (self.help / "wudang").write_text(content, encoding="utf-8")
        cli.BasicKnowledgeSystem(settings=self.settings).process_files()
        preview = self.run_cli("武当剑法", "--bm25", "--top-k", "1")
        full = self.run_cli("武当剑法", "--bm25", "--top-k", "1", "--full")
        self.assertEqual(preview.returncode, 0, preview.stderr)
        self.assertEqual(full.returncode, 0, full.stderr)
        self.assertNotIn("末尾验证标记", preview.stdout)
        self.assertIn("显示前 600/", preview.stdout)
        self.assertIn(content, full.stdout)

    def test_npc_disabled_retrieval_and_threshold_override(self):
        disabled = self.run_cli("武当", "--bm25", "--npc", "disabled")
        enabled = self.run_cli("武当", "--bm25", "--npc", "disabled", "--threshold", "0.4")
        missing = self.run_cli("武当", "--bm25", "--npc", "unknown")
        self.assertEqual(disabled.returncode, 0, disabled.stderr)
        self.assertIn("召回 0 条", disabled.stdout)
        self.assertEqual(enabled.returncode, 0, enabled.stderr)
        self.assertIn("文件：wudang", enabled.stdout)
        self.assertEqual(missing.returncode, 1)
        self.assertIn("找不到 NPC 配置", missing.stderr)

    def test_invalid_arguments_and_no_matches(self):
        for arguments in (("--top-k", "0"), ("--top-k", "501"), ("--threshold", "nan")):
            with self.subTest(arguments=arguments):
                result = self.run_cli("--bm25", *arguments)
                self.assertEqual(result.returncode, 2)
        blank = self.run_cli("   ", "--bm25")
        self.assertEqual(blank.returncode, 1)
        self.assertIn("问题不能为空", blank.stderr)
        no_match = self.run_cli("xyznonexistent", "--bm25")
        self.assertEqual(no_match.returncode, 0, no_match.stderr)
        self.assertIn("没有召回相关资料", no_match.stdout)

    def test_hybrid_uses_game_search_settings_and_displays_all_scores(self):
        knowledge = Mock()
        knowledge.get_stats.return_value = {"indexed_vectors": 2}
        knowledge.hybrid_search.return_value = [{
            "id": "chunk-id", "title": "武当派", "filename": "wudang", "content": "张三丰",
            "sources": ["bm25", "vector"], "score": 0.0325,
            "bm25_score": 2.0, "vector_score": 0.9, "rerank_score": 0.95,
        }]
        settings = replace(self.settings, dashscope_api_key="fake", retrieval_top_k=5)
        output, errors = io.StringIO(), io.StringIO()
        started = time.monotonic()
        with patch.object(cli, "load_settings", return_value=settings), \
             patch.object(cli, "QwenKnowledgeSystem", return_value=knowledge), \
             redirect_stdout(output), redirect_stderr(errors):
            code = cli.main(["武当拜师", "--npc", "npc"])
        self.assertEqual(code, 0, errors.getvalue())
        call = knowledge.hybrid_search.call_args
        self.assertEqual(call.args, ("武当拜师",))
        self.assertEqual(call.kwargs["limit"], 5)
        self.assertEqual(call.kwargs["threshold"], 0.8)
        self.assertGreaterEqual(call.kwargs["deadline"], started + settings.request_timeout)
        self.assertLessEqual(call.kwargs["deadline"], time.monotonic() + settings.request_timeout)
        for text in ("BM25 + 向量", "RRF=0.032500", "BM25=2.000000",
                     "向量余弦=0.900000", "重排=0.950000", "张三丰"):
            self.assertIn(text, output.getvalue())
        knowledge.update_vectors.assert_not_called()
        knowledge.client.close.assert_called_once()
