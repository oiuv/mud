"""脚本分类和迁移回归；只运行帮助、预览与语法检查，不调用模型或服务。"""
import ast
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


SERVICE = Path(__file__).resolve().parents[1]
SCRIPTS = SERVICE / "scripts"


class ScriptEntrypointTests(unittest.TestCase):
    def test_names_are_classified_and_documented(self):
        guide = (SCRIPTS / "README.md").read_text(encoding="utf-8")
        scripts = [path for path in SCRIPTS.iterdir() if path.suffix in (".py", ".mjs")]
        self.assertTrue(scripts)
        for path in scripts:
            with self.subTest(script=path.name):
                self.assertRegex(path.name, r"^(ops|debug|verify|bench|eval|example)_[a-z0-9_]+\.(py|mjs)$")
                self.assertIn(f"`{path.name}`", guide)
        self.assertFalse((SERVICE / "examples/socket_client.py").exists())
        self.assertFalse((SERVICE / "examples/README.md").exists())

    def test_python_entrypoints_parse_without_execution(self):
        for path in SCRIPTS.glob("*.py"):
            with self.subTest(script=path.name):
                ast.parse(path.read_text(encoding="utf-8"), filename=str(path))

    def invoke(self, script, *args, cwd):
        environment = {key: value for key, value in os.environ.items()
                       if key.upper() in {"PATH", "SYSTEMROOT", "TEMP", "TMP", "WINDIR", "COMSPEC"}}
        environment.update(PYTHONUTF8="1", PYTHONIOENCODING="utf-8")
        result = subprocess.run([sys.executable, str(script), *args], cwd=cwd, env=environment,
                                capture_output=True, text=True, encoding="utf-8", timeout=30)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        return result.stdout

    def test_renamed_argparse_entrypoints_help_from_other_directory(self):
        with tempfile.TemporaryDirectory(prefix="ai-script-help-") as temporary:
            for name in ("debug_chat.py", "debug_source.py", "debug_retrieval.py", "debug_socket.py",
                         "bench_retrieval.py", "eval_source.py", "ops_world_content.py", "example_socket.py"):
                with self.subTest(script=name):
                    output = self.invoke(SCRIPTS / name, "--help", cwd=temporary)
                    self.assertIn("--help", output)

    def test_evaluation_preview_from_other_directory(self):
        with tempfile.TemporaryDirectory(prefix="ai-eval-preview-") as temporary:
            output = self.invoke(SCRIPTS / "eval_source.py", "--suite", "synthetic", cwd=temporary)
            preview = json.loads(output)
            self.assertEqual(preview["mode"], "preview")
            self.assertEqual(preview["model_calls"], 0)
            self.assertTrue(preview["synthetic_only"])

    def test_socket_example_remains_standalone_and_preview_only(self):
        with tempfile.TemporaryDirectory(prefix="ai-socket-example-") as temporary:
            target = Path(temporary) / "example_socket.py"
            shutil.copy2(SCRIPTS / target.name, target)
            output = self.invoke(target, '{"type":"config","npc_id":"li bai"}', cwd=temporary)
            self.assertIn("未发送请求", output)
            self.assertEqual({path.name for path in Path(temporary).iterdir()}, {target.name})


if __name__ == "__main__":
    unittest.main()
