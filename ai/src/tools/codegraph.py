"""One optional, deployment-bound CodeGraph query tool; source remains authoritative."""
import json
import re

from ..runtime.cli import command_prefix, run_cli
from ..runtime.contracts import RuntimeFault, json_text
from ..runtime.filesystem import SafeRoot
from .codegraph_queries import OPERATIONS, parse_output, query_arguments


def query_cli(command, root, query, context):
    """Legacy context adapter; the exec migration supplies actual CLI operations."""
    try:
        output = run_cli(command, root, ["context", "--path", str(root), "--format", "json",
                                        "--max-nodes", "16", "--no-code", "--", query], context)
    except RuntimeFault as error:
        code = {"cli_unavailable": "codegraph_unavailable", "cli_failed": "codegraph_unavailable",
                "cli_result_too_large": "codegraph_result_too_large", "cli_invalid_result": "codegraph_invalid_result"}
        raise RuntimeFault(code.get(error.code, error.code), error.status) from None
    try:
        value = json.loads(output)
    except ValueError:
        raise RuntimeFault("codegraph_invalid_result") from None
    if not isinstance(value, dict) or not isinstance(value.get("nodes"), list) or not isinstance(value.get("edges"), list):
        raise RuntimeFault("codegraph_invalid_result")
    return value


class CodeGraph:
    def __init__(self, sources, command):
        self.sources = sources
        self.command = command_prefix(command)

    def authorize(self, context):
        return self.sources.authorize(context, {})

    def arguments(self, context, args):
        return query_arguments(self.authorize(context), args)

    def execute(self, context, args):
        scope = self.authorize(context)
        argv = self.arguments(context, args)
        # Require this exact repository's index; never let the CLI walk up to
        # an ancestor's graph. Index maintenance is not a model operation.
        index = scope.root / ".codegraph"
        if not index.is_dir() or not (index / "codegraph.db").is_file():
            raise RuntimeFault("codegraph_index_missing")
        try:
            with SafeRoot(scope.root).opened(".codegraph/codegraph.db"):
                pass
        except RuntimeFault:
            raise RuntimeFault("codegraph_index_missing") from None
        raw = parse_output(args[0], run_cli(self.command, scope.root, argv, context))
        result = self.filtered(context, scope, raw, 8)
        result["operation"] = args[0]
        if args[0] != "files":
            result["query"] = args[1]
        else:
            paths = []
            for item in raw.get("files", []):
                context.check()
                path = item.get("path") if isinstance(item, dict) else None
                if not isinstance(path, str) or not scope.accepts(path) or path in paths:
                    continue
                try:
                    with SafeRoot(scope.root).opened(path):
                        pass
                except RuntimeFault:
                    continue
                paths.append(path)
                if len(json_text(paths, None).encode("utf-8")) > 28000:
                    paths.pop()
                    result["truncated"] = True
                    break
                if len(paths) >= 64:
                    result["truncated"] = True
                    break
            result["files"] = paths
            if paths:
                result["status"] = "matched"
        return result

    def filtered(self, context, scope, raw, limit):
        result = {"status": "no_match", "symbols": [], "relations": [], "evidence": [],
                  "truncated": False, "untrusted": True,
                  "hint": "关系只作定位线索，不能证明完整 LPC 语义。未命中可用 source.search；补读用 source.read。"}
        visible, seen = {}, set()
        for node in raw["nodes"][:64]:
            context.check()
            if not isinstance(node, dict):
                continue
            path, name = node.get("filePath"), node.get("name")
            start, end = node.get("startLine"), node.get("endLine")
            if (not isinstance(path, str) or not scope.accepts(path) or not isinstance(name, str)
                    or not 0 < len(name) <= 200 or type(start) is not int or type(end) is not int
                    or not 1 <= start <= end or not isinstance(node.get("id"), str)):
                continue
            if (path, start, end) in seen:
                continue
            try:
                evidence = self.sources.snapshot(context, scope, path, start, min(end, start + 119))
            except RuntimeFault as error:
                context.check()
                if error.code in ("line_range_unavailable", "source_changed"):
                    result["status"] = "index_outdated"
                continue  # No denied path, symbol, raw error or private count.
            # Do not label unrelated current lines with an old indexed symbol.
            # This is a conservative location check, not an LPC parser. Ranges
            # and edges remain index hints even if this check succeeds.
            header = "\n".join(evidence["content"].splitlines()[:3])
            is_file = node.get("kind") == "file"
            if not is_file and not re.search(r"(?<![\w$])" + re.escape(name) + r"(?![\w$])", header):
                result["status"] = "index_outdated"
                continue
            if "readStart" in node:
                try:
                    evidence = self.sources.snapshot(context, scope, path, node["readStart"],
                                                     min(node["readEnd"], node["readStart"] + 119),
                                                     expected_hash=evidence["hash"])
                except RuntimeFault:
                    context.check()
                    result["status"] = "index_outdated"
                    continue
            symbol = {"name": path if is_file else name, "path": path,
                      "indexed_start": start, "read_start": evidence["start"],
                      "read_end": evidence["end"], "evidence": evidence["id"]}
            if len(json_text([result, symbol, evidence], None).encode("utf-8")) > 28000:
                result["truncated"] = True
                break
            visible[node["id"]] = evidence["id"]
            seen.add((path, start, end))
            result["symbols"].append(symbol)
            result["evidence"].append(evidence)
            if len(result["symbols"]) >= limit:
                result["truncated"] = True
                break
        # Only relate already readable, returned symbols. No raw summaries,
        # relatedFiles, IDs, statistics, names or error strings leave the adapter.
        for edge in raw["edges"][:128]:
            if (isinstance(edge, dict) and edge.get("source") in visible and edge.get("target") in visible
                    and edge.get("kind") in ("calls", "inherits", "imports", "references", "contains", "implements")):
                relation = {"source": visible[edge["source"]],
                            "target": visible[edge["target"]], "kind": edge["kind"]}
                if len(json_text([result, relation], None).encode("utf-8")) > 32000:
                    result["truncated"] = True
                    break
                result["relations"].append(relation)
        if result["status"] != "index_outdated" and result["evidence"]:
            result["status"] = "matched"
        return result


def build_program(services):
    sources, settings = services.get("sources"), services.get("settings")
    if (sources is None or not sources.scopes or settings is None
            or not settings.source_enabled or not settings.codegraph_enabled):
        return None
    from .exec import Program
    graph = CodeGraph(sources, settings.codegraph_command)
    operations = {name: {"description": OPERATIONS[name], "arguments": {
        "type": "array", "minItems": 0 if name == "files" else 1, "maxItems": 7,
        "items": {"type": "string", "maxLength": 256},
    }} for name in settings.codegraph_operations}
    return Program("codegraph", settings.codegraph_command, settings.source_root,
                   "优先定位源码，返回当前可引用原文。未命中或不可用时 source.search/read 兜底。"
                   "调用关系只作线索；不提供仓库路径或管理命令。",
                   operations, authorize=graph.authorize, execute=graph.execute,
                   validate_arguments=graph.arguments)
