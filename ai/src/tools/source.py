"""Bounded literal search and line snapshots in explicitly granted scopes."""
import fnmatch
import hashlib
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from ..runtime.contracts import Contract, RuntimeFault
from ..runtime.filesystem import SafeRoot, relative_parts
from ..runtime.tools import Tool

PRIVATE_PARTS = frozenset(("data", "log", "logs", "players", "player_data", "userdata", "save",
                           "backups", "backup", "secrets", "credentials", "node_modules", "__pycache__"))
PRIVATE_SUFFIXES = (".db", ".sqlite", ".sqlite3", ".db-wal", ".db-shm", ".pem", ".key", ".p12",
                    ".o", ".log", ".exe", ".dll", ".pyc", ".bin", ".zip", ".gz")


def public_path(path):
    try:
        parts = relative_parts(path)
    except RuntimeFault:
        return False
    lowered = tuple(part.casefold() for part in parts)
    return not (any(part.startswith(".") or part in PRIVATE_PARTS for part in lowered)
                or lowered[-1].endswith(PRIVATE_SUFFIXES)
                or any(word in lowered[-1] for word in ("password", "credential", "secret", "private_key")))


@dataclass(frozen=True)
class Scope:
    name: str
    root: Path
    include: tuple = ("*",)
    exclude: tuple = ()
    extensions: tuple = (".c", ".lpc", ".h", ".md", ".txt")
    agents: frozenset = frozenset()
    audiences: frozenset = frozenset()
    egress: bool = False

    def __post_init__(self):
        object.__setattr__(self, "root", Path(self.root))
        for key in ("include", "exclude", "extensions", "agents", "audiences"):
            values = getattr(self, key)
            if not isinstance(values, (tuple, list, set, frozenset)) or any(not isinstance(x, str) or not x for x in values):
                raise ValueError("Invalid source scope rules")
            object.__setattr__(self, key, frozenset(values) if key in ("agents", "audiences") else tuple(values))
        if (not re.fullmatch(r"[a-z][a-z0-9_-]{0,47}", self.name)
                or not self.root.is_absolute() or type(self.egress) is not bool
                or not self.audiences <= {"player", "admin", "internal"}
                or any(part.casefold() in PRIVATE_PARTS or part.startswith(".") for part in self.root.parts[1:])):
            raise ValueError("Invalid source scope")
        SafeRoot(self.root)

    def accepts(self, path):
        return (public_path(path) and Path(path).suffix.casefold() in self.extensions
                and any(fnmatch.fnmatchcase(path, pattern) for pattern in self.include)
                and not any(fnmatch.fnmatchcase(path, pattern) for pattern in self.exclude))


class Sources:
    def __init__(self, scopes=()):
        self.scopes = {}
        for scope in scopes:
            if scope.name in self.scopes:
                raise ValueError("Duplicate source scope")
            self.scopes[scope.name] = scope

    def authorize(self, context, arguments):
        name = arguments["scope"]
        scope = self.scopes.get(name)
        if (scope is None or name not in context.policy.scopes or context.agent_id not in scope.agents
                or context.audience not in scope.audiences):
            raise RuntimeFault("scope_denied")
        if context.external_model and (not scope.egress or name not in context.policy.egress_scopes):
            raise RuntimeFault("egress_denied")
        if "path" in arguments and not scope.accepts(arguments["path"]):
            raise RuntimeFault("file_unavailable")
        return scope

    def snapshot(self, context, scope, path, start=1, end=120, expected_hash=None):
        context.check()
        if not scope.accepts(path):
            raise RuntimeFault("file_unavailable")
        data = SafeRoot(scope.root).read(path)
        context.check()
        if b"\0" in data:
            raise RuntimeFault("file_unavailable")
        try:
            content = data.decode("utf-8-sig")
        except UnicodeError:
            raise RuntimeFault("file_unavailable") from None
        digest = hashlib.sha256(data).hexdigest()
        if expected_hash is not None and digest != expected_hash:
            raise RuntimeFault("source_changed")
        lines = content.splitlines()
        if start > max(1, len(lines)):
            raise RuntimeFault("line_range_unavailable")
        selected = lines[start - 1:end]
        text = "\n".join(selected)
        if len(text.encode("utf-8")) > 24576:
            raise RuntimeFault("result_too_large")
        return {"id": "source:" + uuid.uuid4().hex, "scope": scope.name, "path": path,
                "start": start, "end": min(end, len(lines)), "content": text, "hash": digest,
                "read_at": datetime.now(timezone.utc).isoformat(), "truncated": end < len(lines)}

    def read(self, context, arguments):
        scope = self.authorize(context, arguments)
        start, end = arguments.get("start", 1), arguments.get("end", arguments.get("start", 1) + 119)
        if end < start or end - start >= 200:
            raise RuntimeFault("line_range_unavailable")
        return {"evidence": [self.snapshot(context, scope, arguments["path"], start, end,
                                           arguments.get("expected_hash"))], "untrusted": True}

    def search(self, context, arguments):
        scope = self.authorize(context, arguments)
        root = SafeRoot(scope.root)
        pending, matches = [""], []
        scanned, scanned_bytes, entries_left, truncated = 0, 0, 4096, False
        maximum = arguments.get("limit", 10)
        query = arguments["query"]
        while pending:
            context.check()
            directory = pending.pop()
            try:
                entries, partial = root.entries(directory, max(1, entries_left))
            except RuntimeFault:
                truncated = True
                continue
            entries_left -= len(entries)
            truncated |= partial
            for name, is_directory in entries:
                context.check()
                path = f"{directory}/{name}" if directory else name
                if not public_path(path) or any(fnmatch.fnmatchcase(path, pattern) for pattern in scope.exclude):
                    continue
                if is_directory:
                    pending.append(path)
                    continue
                if not scope.accepts(path):
                    continue
                if scanned >= 256 or scanned_bytes >= 4194304:
                    return {"evidence": matches, "truncated": True, "untrusted": True}
                try:
                    data = root.read(path)
                    context.check()
                    if b"\0" in data:
                        continue
                    content = data.decode("utf-8-sig")
                except (RuntimeFault, UnicodeError):
                    # Never reveal names/counts of denied or non-text objects.
                    truncated = True
                    continue
                scanned += 1
                scanned_bytes += len(data)
                digest = hashlib.sha256(data).hexdigest()
                lines = content.splitlines()
                for number, line in enumerate(lines, 1):
                    if query not in line and query not in path:
                        continue
                    if len(line.encode("utf-8")) > 2048:
                        truncated = True
                        continue
                    matches.append({"id": "source:" + uuid.uuid4().hex, "scope": scope.name, "path": path,
                                    "start": number, "end": number, "content": line, "hash": digest,
                                    "read_at": datetime.now(timezone.utc).isoformat(), "truncated": True})
                    if len(matches) >= maximum:
                        return {"evidence": matches, "truncated": True, "untrusted": True}
            if entries_left <= 0:
                truncated = True
                break
        return {"evidence": matches, "truncated": truncated, "untrusted": True}


def build_tools(services):
    sources = services.get("sources")
    if sources is None:
        return
    scope = {"type": "string", "pattern": "^[a-z][a-z0-9_-]{0,47}$"}
    result = Contract({"type": "object", "required": ["evidence", "untrusted"],
                       "properties": {"evidence": {"type": "array", "maxItems": 10},
                                      "untrusted": {"const": True}, "truncated": {"type": "boolean"}},
                       "additionalProperties": False})
    for name, description, handler, properties, required in (
        ("source.search", "在已授权范围内按字面量搜索内容或相对路径；截断不代表不存在。", sources.search,
         {"scope": scope, "query": {"type": "string", "minLength": 1, "maxLength": 128},
          "limit": {"type": "integer", "minimum": 1, "maximum": 10}}, ["scope", "query"]),
        ("source.read", "读取获准文件的行片段；继续读取时传 expected_hash，防止混合版本。", sources.read,
         {"scope": scope, "path": {"type": "string", "minLength": 1, "maxLength": 512},
          "start": {"type": "integer", "minimum": 1}, "end": {"type": "integer", "minimum": 1},
          "expected_hash": {"type": "string", "pattern": "^[a-f0-9]{64}$"}}, ["scope", "path"]),
    ):
        yield Tool(name, description, Contract({"type": "object", "properties": properties,
                                               "required": required, "additionalProperties": False}),
                   result, handler, sources.authorize, timeout=5, resource="source", concurrent_safe=True)
