"""Load ai/.env once per startup; paths never depend on cwd."""
import json
import math
import os
from dataclasses import dataclass, field
from pathlib import Path
from dotenv import load_dotenv

from .runtime.context import Policy

SERVICE_DIR = Path(__file__).resolve().parents[1]


@dataclass
class Settings:
    data_dir: Path = SERVICE_DIR / "data"
    help_dir: Path = SERVICE_DIR.parent / "help"
    roles_file: Path = SERVICE_DIR / "config/npc_roles.json"
    skills_dir: Path = SERVICE_DIR / "skills"
    host: str = "127.0.0.1"
    port: int = 9999
    debug: bool = False
    enabled_modules: tuple = ("npc", "world")
    runtime_policy: dict = field(default_factory=dict)
    source_scopes_file: Path | None = None
    knowledge_update_enabled: bool = True
    chat_api_key: str = field(default="", repr=False)
    chat_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    chat_model: str = "qwen3.8-flash"
    chat_supports_tools: bool = True
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
    world_enabled: bool = False
    world_content_dir: Path = SERVICE_DIR.parent / "data/illusion_world"
    world_timeout: float = 90.0
    world_lease: float = 180.0
    world_short_timeout: float = 3.0
    world_short_workers: int = 2
    world_queue_limit: int = 256
    world_daily_limit: int = 300
    world_storage_bytes: int = 1073741824
    world_disk_headroom: int = 67108864

    def __post_init__(self):
        Policy().restrict(self.runtime_policy)  # Fail closed on malformed deployment limits.
        if (not isinstance(self.enabled_modules, tuple)
                or any(name not in ("npc", "world") for name in self.enabled_modules)
                or len(set(self.enabled_modules)) != len(self.enabled_modules)):
            raise ValueError("ENABLED_MODULES must contain unique built-in module names: npc,world")
        for name in ("knowledge_update_enabled", "chat_supports_tools"):
            if type(getattr(self, name)) is not bool:
                raise ValueError(f"{name} must be true/false")
        for name in ("data_dir", "help_dir", "roles_file", "skills_dir", "world_content_dir"):
            path = Path(getattr(self, name)).expanduser()
            setattr(self, name, path if path.is_absolute() else SERVICE_DIR / path)
        if self.source_scopes_file is not None:
            if not str(self.source_scopes_file).strip():
                self.source_scopes_file = None
            else:
                path = Path(self.source_scopes_file).expanduser()
                self.source_scopes_file = path if path.is_absolute() else SERVICE_DIR / path
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
        for name in ("world_timeout", "world_lease", "world_short_timeout", "world_short_workers",
                     "world_queue_limit", "world_daily_limit", "world_storage_bytes", "world_disk_headroom"):
            value = getattr(self, name)
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value <= 0:
                raise ValueError(f"{name} must be positive and finite")
        for name in ("world_short_workers", "world_queue_limit", "world_daily_limit", "world_storage_bytes", "world_disk_headroom"):
            if type(getattr(self, name)) is not int:
                raise ValueError(f"{name} must be an integer")
        if self.world_timeout > 90 or self.world_lease < self.world_timeout + 30:
            raise ValueError("WORLD_TIMEOUT <=90 and WORLD_LEASE >= timeout+30 required")
        if self.world_short_timeout > 5 or self.world_short_workers > 4 or self.world_queue_limit > 256:
            raise ValueError("World short requests/queue exceed bounded capacity")


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
        elif isinstance(default, tuple):
            value = tuple(part.strip() for part in value.split(",")) if value.strip() else ()
        setattr(config, name, value)
    config.__post_init__()
    return config
