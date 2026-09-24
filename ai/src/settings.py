"""Load ai/.env once per startup; paths never depend on cwd."""
import json
import math
import os
from dataclasses import dataclass, field
from pathlib import Path
from dotenv import load_dotenv

SERVICE_DIR = Path(__file__).resolve().parents[1]


@dataclass
class Settings:
    data_dir: Path = SERVICE_DIR / "data"
    help_dir: Path = SERVICE_DIR.parent / "help"
    roles_file: Path = SERVICE_DIR / "config/npc_roles.json"
    host: str = "127.0.0.1"
    port: int = 9999
    debug: bool = False
    chat_api_key: str = field(default="", repr=False)
    chat_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    chat_model: str = "qwen3.7-flash"
    chat_extra_body: dict = field(default_factory=lambda: {"enable_thinking": False})
    dashscope_api_key: str = field(default="", repr=False)
    embedding_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    embedding_model: str = "qwen3.7-text-embedding-flash"
    embedding_dimensions: int = 1024
    embedding_max_bytes: int = 128000
    rerank_url: str = "https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank"
    rerank_model: str = "qwen3.7-text-rerank"
    rerank_enabled: bool = True
    rerank_max_bytes: int = 30000
    rerank_total_bytes: int = 120000
    api_timeout: float = 20.0
    chat_timeout: float = 60.0
    summary_timeout: float = 20.0
    request_timeout: float = 80.0
    max_workers: int = 8
    max_message_chars: int = 1000
    max_response_chars: int = 1600
    max_tokens: int = 2048
    history_max_chars: int = 24000
    knowledge_max_chars: int = 10000
    chunk_size: int = 3000
    chunk_overlap: int = 200
    retrieval_candidates: int = 12
    retrieval_top_k: int = 3
    vector_cache_size: int = 512
    vector_cache_ttl: float = 1800.0
    request_cache_size: int = 1024
    request_cache_ttl: float = 300.0

    def __post_init__(self):
        for name in ("data_dir", "help_dir", "roles_file"):
            path = Path(getattr(self, name)).expanduser()
            setattr(self, name, path if path.is_absolute() else SERVICE_DIR / path)
        for name in ("embedding_dimensions", "embedding_max_bytes", "rerank_max_bytes",
                     "rerank_total_bytes", "api_timeout", "chat_timeout", "summary_timeout",
                     "request_timeout", "max_workers",
                     "max_message_chars", "max_response_chars", "max_tokens", "history_max_chars",
                     "knowledge_max_chars", "chunk_size", "retrieval_candidates", "retrieval_top_k",
                     "vector_cache_size", "vector_cache_ttl", "request_cache_size", "request_cache_ttl"):
            if not math.isfinite(getattr(self, name)) or getattr(self, name) <= 0:
                raise ValueError(f"{name} must be positive")
        if not 0 <= self.chunk_overlap < self.chunk_size:
            raise ValueError("CHUNK_OVERLAP must be smaller than CHUNK_SIZE")
        if self.request_timeout > 80:
            raise ValueError("REQUEST_TIMEOUT must be <=80 to fit the LPC timeout")
        if self.retrieval_candidates > 500 or self.retrieval_top_k > 500:
            raise ValueError("Rerank supports at most 500 candidate documents")
        if not 1 <= self.port <= 65535:
            raise ValueError("SERVER_PORT must be between 1 and 65535")
        if self.max_message_chars > 1000 or self.max_response_chars > 1600:
            raise ValueError("UDP limits: MAX_MESSAGE_CHARS <= 1000, MAX_RESPONSE_CHARS <= 1600")


def load_settings(env_file=None):
    load_dotenv(env_file or SERVICE_DIR / ".env", override=False)
    config = Settings()
    env_names = {
        "data_dir": "DATA_DIR", "help_dir": "HELP_DIR", "roles_file": "NPC_ROLES_FILE",
        "host": "SERVER_HOST", "port": "SERVER_PORT", "debug": "DEBUG",
        "chat_api_key": "OPENAI_API_KEY", "chat_base_url": "OPENAI_BASE_URL",
        "chat_model": "OPENAI_MODEL", "dashscope_api_key": "DASHSCOPE_API_KEY",
        "max_tokens": "OPENAI_MAX_TOKENS",
    }
    workspace = os.getenv("DASHSCOPE_WORKSPACE_ID", "").strip()
    if workspace:
        origin = f"https://{workspace}.cn-beijing.maas.aliyuncs.com"
        config.chat_base_url = origin + "/compatible-mode/v1"
        config.embedding_base_url = origin + "/compatible-mode/v1"
        config.rerank_url = origin + "/api/v1/services/rerank/text-rerank/text-rerank"
    for name in config.__dataclass_fields__:
        value = os.getenv(env_names.get(name, name.upper()))
        if value is None:
            continue
        default = getattr(config, name)
        if isinstance(default, bool):
            if value.lower() not in ("true", "false", "1", "0"):
                raise ValueError(f"{name} must be true/false")
            value = value.lower() in ("true", "1")
        elif isinstance(default, int):
            value = int(value)
        elif isinstance(default, float):
            value = float(value)
        elif isinstance(default, dict):
            value = json.loads(value)
            if not isinstance(value, dict):
                raise ValueError(f"{name} must be a JSON object")
        setattr(config, name, value)
    config.__post_init__()
    return config
