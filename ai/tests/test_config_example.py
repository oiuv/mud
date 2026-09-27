"""Concise example and full reference retain the same effective defaults."""
from dataclasses import asdict
from io import StringIO
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from dotenv import dotenv_values
from ai.src.settings import SERVICE_DIR, Settings, load_settings


class ConfigExampleTests(unittest.TestCase):
    def normalized(self, settings):
        return {key: os.path.abspath(value) if isinstance(value, Path) else value
                for key, value in asdict(settings).items()}

    def test_short_example_full_reference_and_defaults_are_equivalent(self):
        document = (SERVICE_DIR.parent / "docs/architecture/ai-configuration.md").read_text(encoding="utf-8")
        expanded = document.split("\x60\x60\x60dotenv\n", 1)[1].split("\n\x60\x60\x60", 1)[0]
        values = dict(dotenv_values(stream=StringIO(expanded)))
        with patch.dict(os.environ, {}, clear=True):
            concise = load_settings(SERVICE_DIR / ".env.example")
        with patch.dict(os.environ, values, clear=True):
            full = load_settings(SERVICE_DIR / "absent-example-test.env")
        self.assertEqual(self.normalized(concise), self.normalized(full))
        self.assertEqual(self.normalized(concise), self.normalized(Settings()))

    def test_explicit_overrides_and_other_working_directory(self):
        with tempfile.TemporaryDirectory(prefix="ai-config-example-") as temp:
            before = Path.cwd()
            try:
                os.chdir(temp)
                with patch.dict(os.environ, {
                    "OPENAI_MODEL": "configured-test", "SOURCE_ENABLED": "false",
                    "CODEGRAPH_ENABLED": "false", "CODEGRAPH_COMMAND": "C:/Program Files/cg.cmd",
                    "CODEGRAPH_OPERATIONS": "query,node",
                    "OPENAI_CONTEXT_WINDOW_TOKENS": "500000",
                    "OPENAI_MODEL_MAX_OUTPUT_TOKENS": "32000",
                }, clear=True):
                    settings = load_settings(SERVICE_DIR / ".env.example")
            finally:
                os.chdir(before)
        self.assertEqual(settings.chat_model, "configured-test")
        self.assertFalse(settings.source_enabled)
        self.assertFalse(settings.codegraph_enabled)
        self.assertEqual(settings.codegraph_command, "C:/Program Files/cg.cmd")
        self.assertEqual(settings.codegraph_operations, ("query", "node"))
        self.assertEqual(settings.source_root, SERVICE_DIR.parent)
        self.assertEqual(settings.context_window_tokens, 500000)
        self.assertEqual(settings.model_max_output_tokens, 32000)
