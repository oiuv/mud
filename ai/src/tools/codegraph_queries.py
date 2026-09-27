"""CLI argv and location decoding; no raw CLI prose crosses the tool boundary."""
import json
import re

from ..runtime.contracts import RuntimeFault
from .source import public_path

OPERATIONS = {
    "explore": "explore <query> [--max-files 1..4]：功能实现及相关源码",
    "query": "query <symbol> [--limit 1..8] [--kind function|method|class|file]：符号定位",
    "callers": "callers <symbol> [--limit 1..8]：谁调用它",
    "callees": "callees <symbol> [--limit 1..8]：它调用谁",
    "impact": "impact <symbol> [--depth 1..4]：变更影响线索",
    "node": "node <symbol-or-file> [--file path]：当前原文，file 用于同名消歧；指定行补读用 source.read",
    "files": "files [--filter directory] [--pattern glob]：当前可读文件列表",
}
_OPTIONS = {
    "explore": {"--max-files": (1, 4)},
    "query": {"--limit": (1, 8), "--kind": ("function", "method", "class", "file")},
    "callers": {"--limit": (1, 8)}, "callees": {"--limit": (1, 8)},
    "impact": {"--depth": (1, 4)},
    "node": {"--file": "path"},
    "files": {"--filter": "directory", "--pattern": "text"},
}
_DEFAULTS = {"explore": {"--max-files": "4"}, "query": {"--limit": "8"},
             "callers": {"--limit": "8"}, "callees": {"--limit": "8"},
             "impact": {"--depth": "2"}, "node": {"--limit": "120"}, "files": {}}


def query_arguments(scope, args):
    if not args or args[0] not in OPERATIONS:
        raise RuntimeFault("cli_operation_denied")
    operation = args[0]
    positional = [] if operation == "files" else args[1:2]
    if operation != "files" and (not positional or not positional[0].strip()):
        raise RuntimeFault("contract_violation")
    if operation == "node":
        value = positional[0]
        if ("/" in value or "\\" in value or value.startswith(".") or value.endswith(scope.extensions)):
            if not scope.accepts(value):
                raise RuntimeFault("file_unavailable")
    rest = args[1:] if operation == "files" else args[2:]
    if len(rest) % 2:
        raise RuntimeFault("contract_violation")
    options = {}
    for flag, value in zip(rest[::2], rest[1::2]):
        rule = _OPTIONS[operation].get(flag)
        if rule is None or flag in options:
            raise RuntimeFault("cli_operation_denied")
        if isinstance(rule, tuple):
            if type(rule[0]) is int:
                if not value.isascii() or not value.isdecimal() or not rule[0] <= int(value) <= rule[1]:
                    raise RuntimeFault("contract_violation")
            elif value not in rule:
                raise RuntimeFault("contract_violation")
        elif rule == "path" and not scope.accepts(value):
            raise RuntimeFault("file_unavailable")
        elif rule == "directory" and (not public_path(value) or scope.excludes(value)):
            raise RuntimeFault("file_unavailable")
        options[flag] = value
    argv = [operation, "--path", str(scope.root)]
    if operation not in ("explore", "node"):
        argv.append("--json")
    for flag, value in {**_DEFAULTS[operation], **options}.items():
        argv.extend((flag, value))
    if positional:
        argv.extend(("--", positional[0]))
    return argv


def node(path, name, start, end=None, kind="function"):
    return {"id": f"{path}:{start}:{name}", "filePath": path, "name": name,
            "startLine": start, "endLine": end if end is not None else start + 119, "kind": kind}


def parse_output(operation, output):
    if operation not in ("explore", "node"):
        # CodeGraph 1.6 emits these informational lines even with --json.
        # Recognize only its known empty-result responses; never forward the
        # echoed symbol or treat arbitrary malformed output as a successful query.
        empty_files = (operation == "files" and re.fullmatch(
            r'(?:ℹ|\[i\]) No files found matching the criteria\.', output.strip()))
        empty_symbol = (operation in ("callers", "callees", "impact") and
                        re.fullmatch(r'(?:ℹ|\[i\]) Symbol "[^\r\n]*" not found', output.strip()))
        if empty_files or empty_symbol:
            return {"files": [], "nodes": [], "edges": []}
        try:
            value = json.loads(output)
        except ValueError:
            raise RuntimeFault("codegraph_invalid_result") from None
        if operation in ("query", "files"):
            if not isinstance(value, list):
                raise RuntimeFault("codegraph_invalid_result")
            if operation == "files":
                return {"files": value, "nodes": [], "edges": []}
            nodes = [item.get("node", {}) for item in value if isinstance(item, dict)]
        else:
            key = "affected" if operation == "impact" else operation
            if not isinstance(value, dict) or not isinstance(value.get(key), list):
                raise RuntimeFault("codegraph_invalid_result")
            nodes = value[key]
        return {"nodes": [
            node(n.get("filePath"), n.get("name"), n.get("startLine"),
                 n.get("endLine"), n.get("kind", "function"))
            for n in nodes if isinstance(n, dict) and type(n.get("startLine")) is int
        ], "edges": []}
    nodes, edges = [], []
    if operation == "node":
        for match in re.finditer(r"\*\*([^*\n]+)\*\* \(([^)\n]+)\)\s+"
                                 r"\*\*Location:\*\* ([^\n]+):(\d+)\b", output):
            name, kind, path, start = match.groups()
            found = node(path, name, int(start), kind=kind)
            # The declaration and returned excerpt can have distinct positions.
            # Validate the declaration before returning the current excerpt.
            block = re.search(r"\x60{3}[^\n]*\n(.*?)\n\x60{3}", output[match.end():], re.S)
            numbered = re.findall(r"^(\d+)\t", block[1], re.M) if block else []
            if numbered:
                found.update(readStart=int(numbered[0]), readEnd=int(numbered[-1]))
                nodes.append(found)
    else:
        # explore returns current numbered file blocks. Indexed symbol positions
        # are still verified against our own safe read before use.
        blocks = re.findall(r"\*\*\x60([^\x60\n]+)\x60\*\*[^\n]*\n+\x60{3}[^\n]*\n(.*?)\n\x60{3}",
                            output, re.S)
        paths = {path for path, _ in blocks}
        for name, path, start in re.findall(r"- \x60([^\x60\n]+)\x60 \(([^\n]+?):(\d+)\)", output):
            if path in paths:
                nodes.append(node(path, name, int(start)))
        for path, block in blocks:
            if not any(n["filePath"] == path for n in nodes):
                lines = re.findall(r"^(\d+)\t", block, re.M)
                if lines:
                    nodes.append(node(path, path, int(lines[0]), int(lines[-1]), "file"))
        by_name = {}
        for item in nodes:
            by_name.setdefault(item["name"], []).append(item["id"])
        for kind, section in re.findall(r"\*\*(calls|inherits|imports|references|contains|implements):\*\*\n(.*?)(?=\n\*\*|\Z)",
                                        output, re.S):
            for source, target in re.findall(r"^- ([^\n]+?) → ([^\n]+)$", section, re.M):
                left, right = by_name.get(source, []), by_name.get(target, [])
                if len(left) == len(right) == 1:
                    edges.append({"source": left[0], "target": right[0], "kind": kind})
    return {"nodes": nodes, "edges": edges}
