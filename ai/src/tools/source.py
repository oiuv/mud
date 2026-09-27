"""Bounded literal search and line snapshots in one trusted repository."""
import fnmatch
import hashlib
import json
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from ..runtime.contracts import Contract, RuntimeFault
from ..runtime.context import Policy
from ..runtime.filesystem import SafeRoot, relative_parts
from ..runtime.tools import Tool

PRIVATE_PARTS = frozenset(("data", "log", "logs", "players", "player_data", "userdata", "save",
                           "backups", "backup", "secrets", "credentials", "node_modules", "__pycache__",
                           "build", "dist", "cache", "coverage"))
PRIVATE_SUFFIXES = (".db", ".sqlite", ".sqlite3", ".db-wal", ".db-shm", ".pem", ".key", ".p12",
                    ".o", ".log", ".exe", ".dll", ".pyc", ".bin", ".zip", ".gz")
# Public game rules, not a blanket exception for data directories or save files.
PUBLIC_FILES = frozenset(("data/e2c_dict.o",))


def public_path(path):
    try:
        parts = relative_parts(path)
    except RuntimeFault:
        return False
    if path in PUBLIC_FILES:
        return True
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
    extensions: tuple = (".c", ".lpc", ".h", ".md", ".txt", ".py", ".js", ".mjs", ".ts",
                         ".tsx", ".jsx", ".cc", ".cpp", ".hpp", ".y", ".l", ".sh", ".ps1")
    revision: str = ""

    def __post_init__(self):
        object.__setattr__(self, "root", Path(self.root))
        for key in ("include", "exclude", "extensions"):
            values = getattr(self, key)
            if not isinstance(values, (tuple, list, set, frozenset)) or any(not isinstance(x, str) or not x for x in values):
                raise ValueError("Invalid source scope rules")
            object.__setattr__(self, key, tuple(values))
        if (not re.fullmatch(r"[a-z][a-z0-9_-]{0,47}", self.name) or self.name == "knowledge"
                or not self.root.is_absolute()
                or not isinstance(self.revision, str) or len(self.revision) > 128
                or any(ord(char) < 32 for char in self.revision)
                or any(part.casefold() in PRIVATE_PARTS or part.startswith(".") for part in self.root.parts[1:])):
            raise ValueError("Invalid source scope")
        Policy(knowledge_paths=(self.include, self.exclude))
        if any(not re.fullmatch(r"\.[a-z0-9]{1,12}", ext) for ext in self.extensions):
            raise ValueError("Source extensions must be lowercase suffixes")
        SafeRoot(self.root)

    def accepts(self, path):
        return (public_path(path) and (path in PUBLIC_FILES or Path(path).suffix.casefold() in self.extensions)
                and any(fnmatch.fnmatchcase(path, pattern) for pattern in self.include)
                and not self.excludes(path))

    def excludes(self, path):
        # A Windows caller must not evade a private path with different casing.
        return any(fnmatch.fnmatchcase(path.casefold(), pattern.casefold()) for pattern in self.exclude)


class Sources:
    def __init__(self, scopes=()):
        self.scopes = {}
        for scope in scopes:
            if scope.name in self.scopes:
                raise ValueError("Duplicate source scope")
            self.scopes[scope.name] = scope
        if len(self.scopes) > 1:
            raise ValueError("Only one source repository is supported")

    def fingerprint(self, names):
        """Invalidate replay authority when a trusted deployment scope changes."""
        records = []
        for name in sorted(names):
            scope = self.scopes[name]
            records.append({"name": name, "root": str(scope.root),
                            "revision": scope.revision, "public_files": sorted(PUBLIC_FILES),
                            **{key: sorted(getattr(scope, key))
                            for key in ("include", "exclude", "extensions")}})
        return hashlib.sha256(json.dumps(records, sort_keys=True).encode("utf-8")).hexdigest()

    def authorize(self, context, arguments):
        name = next(iter(self.scopes), None)
        scope = self.scopes.get(name)
        if scope is None or name not in context.policy.scopes:
            raise RuntimeFault("scope_denied")
        if context.external_model and name not in context.policy.egress_scopes:
            raise RuntimeFault("egress_denied")
        if "path" in arguments and not scope.accepts(arguments["path"]):
            raise RuntimeFault("file_unavailable")
        return scope

    def snapshot(self, context, scope, path, start=1, end=120, expected_hash=None,
                 start_column=None, end_column=None):
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
        if start > len(lines):
            raise RuntimeFault("line_range_unavailable")
        selected = lines[start - 1:end]
        columns = {}
        if start_column is not None or end_column is not None:
            # One-based inclusive Unicode character positions in a single line.
            if (start != end or start_column is None or end_column is None
                    or not 1 <= start_column <= end_column <= len(selected[0])):
                raise RuntimeFault("line_range_unavailable")
            selected = [selected[0][start_column - 1:end_column]]
            columns = {"start_column": start_column, "end_column": end_column}
        text = "\n".join(selected)
        if len(text.encode("utf-8")) > 24576:
            raise RuntimeFault("result_too_large")
        return {"id": "source:" + uuid.uuid4().hex, "scope": scope.name, "path": path,
                "start": start, "end": min(end, len(lines)), "content": text, "hash": digest,
                "read_at": datetime.now(timezone.utc).isoformat(),
                "truncated": bool(columns) or start > 1 or end < len(lines),
                "origin": "source.read", "revision": scope.revision, **columns}

    def read(self, context, arguments):
        scope = self.authorize(context, arguments)
        start, end = arguments.get("start", 1), arguments.get("end", arguments.get("start", 1) + 119)
        if end < start or end - start >= 200:
            raise RuntimeFault("line_range_unavailable")
        return {"evidence": [self.snapshot(context, scope, arguments["path"], start, end,
                                           arguments.get("expected_hash"), arguments.get("start_column"),
                                           arguments.get("end_column"))], "untrusted": True}

    def search(self, context, arguments):
        scope = self.authorize(context, arguments)
        root = SafeRoot(scope.root)
        matches = []
        scanned, scanned_bytes, entries_left, truncated = 0, 0, 4096, False
        maximum = arguments.get("limit", 10)
        query = arguments["query"]
        path_glob = arguments.get("path_glob", "*")
        # Start at the literal directory prefix, not at unrelated repository
        # branches which could exhaust the bounded scan before this directory.
        prefix = []
        for part in path_glob.split("/")[:-1]:
            if any(char in part for char in "*?["):
                break
            prefix.append(part)
        directory = "/".join(prefix)
        pending = [] if directory and (not public_path(directory) or scope.excludes(directory)) else [directory]
        # Probe exact public files without enumerating their private siblings.
        public_entries = []
        for path in sorted(PUBLIC_FILES):
            if not scope.accepts(path) or not fnmatch.fnmatchcase(path, path_glob):
                continue
            context.check()
            try:
                with root.opened(path):
                    pass
            except RuntimeFault:
                continue
            public_entries.append((path, False))
        while pending or public_entries:
            context.check()
            if public_entries:
                directory, entries, partial, examined = "", public_entries, False, len(public_entries)
                public_entries = []
            else:
                directory = pending.pop()
                try:
                    entries, partial, examined = root.entries(directory, max(1, entries_left), with_count=True)
                except RuntimeFault:
                    truncated = True
                    continue
            entries_left -= examined
            truncated |= partial
            for name, is_directory in entries:
                context.check()
                path = f"{directory}/{name}" if directory else name
                if not public_path(path) or scope.excludes(path):
                    continue
                if is_directory:
                    pending.append(path)
                    continue
                if not scope.accepts(path):
                    continue
                if not fnmatch.fnmatchcase(path, path_glob):
                    continue
                if scanned >= 256 or scanned_bytes >= 4194304:
                    return {"evidence": matches, "truncated": True, "untrusted": True}
                try:
                    data = root.read(path, max_bytes=min(262144, 4194304 - scanned_bytes))
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
                # A filename match is one navigation clue, not a match on every line.
                path_only = query in path and not any(query in line for line in lines)
                for number, line in enumerate(lines, 1):
                    if query not in line and not path_only:
                        continue
                    columns = {}
                    if len(line.encode("utf-8")) > 2048:
                        offset = max(0, line.find(query) - 80) if not path_only else 0
                        stop = min(len(line), offset + len(query) + 160)
                        line = line[offset:stop]
                        columns = {"start_column": offset + 1, "end_column": stop}
                        truncated = True
                    matches.append({"id": "source:" + uuid.uuid4().hex, "scope": scope.name, "path": path,
                                    "start": number, "end": number, "content": line, "hash": digest,
                                    "read_at": datetime.now(timezone.utc).isoformat(), "truncated": True,
                                    "origin": "source.search", "revision": scope.revision, **columns})
                    if len(matches) >= maximum:
                        return {"evidence": matches, "truncated": True, "untrusted": True}
                    if path_only:
                        break
            if entries_left <= 0:
                truncated = True
                break
        return {"evidence": matches, "truncated": truncated, "untrusted": True}


def build_tools(services):
    sources = services.get("sources")
    if sources is None:
        return
    result = Contract({"type": "object", "required": ["evidence", "untrusted"],
                       "properties": {"evidence": {"type": "array", "maxItems": 10},
                                      "untrusted": {"const": True}, "truncated": {"type": "boolean"}},
                       "additionalProperties": False})
    for name, description, handler, properties, required in (
        ("source.search", "在已授权范围内按字面量搜索内容或相对路径；已知目录/文件时用 path_glob 缩小范围。"
         "公共名称映射可查 data/e2c_dict.o。长行返回命中附近片段及列位置；截断不代表不存在。", sources.search,
         {"query": {"type": "string", "minLength": 1, "maxLength": 128,
                                    "description": "一个连续的字面字符串；空格不表示多个关键词，不能用正则表达式。"},
          "path_glob": {"type": "string", "minLength": 1, "maxLength": 512,
                        "description": "可选相对路径过滤，如 skills/* 或 */example.c；区分大小写，使用 /，"
                                       "支持 *、?、[]，* 可跨目录；只缩小已授权范围。"},
          "limit": {"type": "integer", "minimum": 1, "maximum": 10}}, ["query"]),
        ("source.read", "读取获准文件的行片段；继续读取时传 expected_hash，防止混合版本。"
         "长行可按搜索返回的列位置补读：start=end，start_column/end_column 为从 1 起含两端的字符位置。", sources.read,
         {"path": {"type": "string", "minLength": 1, "maxLength": 512},
          "start": {"type": "integer", "minimum": 1}, "end": {"type": "integer", "minimum": 1},
          "start_column": {"type": "integer", "minimum": 1},
          "end_column": {"type": "integer", "minimum": 1},
          "expected_hash": {"type": "string", "pattern": "^[a-f0-9]{64}$"}}, ["path"]),
    ):
        yield Tool(name, description, Contract({"type": "object", "properties": properties,
                                               "required": required, "additionalProperties": False}),
                   result, handler, sources.authorize, timeout=5, resource="source", concurrent_safe=True)
