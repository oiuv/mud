"""Player prose and trusted local diagnostic views of the same verified result."""
import re

from ..runtime.contracts import RuntimeFault

ANSI = re.compile(r"\x1b\[[0-9;]*m")
CODE_TEXT = re.compile(
    r"(?:\b[A-Za-z_]\w*\s*\(\s*\)|\b[A-Za-z0-9_./\\-]+\.(?:lpc|c|h)\b"
    r"|#[ \t]*(?:include|define)\b|\b[A-Za-z_]\w*->)")


def player_text_gaps(text, context):
    plain = ANSI.sub("", text)
    if (any(ord(char) < 32 and char not in "\n\t" for char in plain) or "\x7f" in plain
            or CODE_TEXT.search(plain)
            or re.search(r"\b(?:api|json|lpc|http|sdk)\b", plain, re.IGNORECASE)
            or any(token in plain for token in ("API", "数据库", "后台队列", "源码", "源代码", "source:", "knowledge:"))):
        return ["unsafe_player_text"]
    for key, evidence in context.state.evidence.items():
        if key in plain:
            return ["unsafe_player_text"]
        if evidence.get("origin") not in ("source.read", "source.search"):
            continue
        path = evidence.get("path", "")
        if path and path in plain:
            return ["unsafe_player_text"]
        # Match source identifiers, not game commands such as learn/look/pray.
        symbols = re.findall(r"\b([A-Za-z_]\w*)\s*\(", evidence.get("content", ""))
        if any("_" in name and re.search(r"\b" + re.escape(name) + r"\b", plain) for name in symbols):
            return ["unsafe_player_text"]
    return []


def present_result(outcome, sources):
    """Audience comes from the trusted run, never a flag inside a model result.

    Only settled outcomes may be presented as completed. The admin projection
    rechecks scope authorization before revealing quoted source snapshots.
    """
    context, result = outcome.context, outcome.result
    if not outcome.finalized:
        raise RuntimeFault("result_not_finalized")
    if context.audience not in ("player", "admin"):
        raise RuntimeFault("audience_denied")
    value = result.value if isinstance(result.value, dict) else {}
    answer = value.get("answer", "问学先生说：此事尚须查证，暂不敢贸然指点。")
    if context.audience == "player":
        if player_text_gaps(answer, context):
            raise RuntimeFault("unsafe_player_text")
        return {"status": result.status, "answer": answer}
    investigation = value.get("investigation") or {}
    keys = set(investigation.get("entry", ()))
    for item in value.get("claims", ()):
        keys.update(item.get("evidence", ()))
    evidence = []
    for key in sorted(keys):
        item = context.state.evidence.get(key)
        if item is None or item.get("origin") != "source.read":
            raise RuntimeFault("source_read_required")
        if item["scope"] not in sources.scopes:
            raise RuntimeFault("scope_denied")
        sources.authorize(context, {"path": item["path"]})
        evidence.append({name: item[name] for name in
                         ("id", "scope", "path", "start", "end", "start_column", "end_column",
                          "content", "hash", "read_at", "revision") if name in item})
    return {"status": result.status, "answer": answer, "code": result.code,
            "claims": value.get("claims", []), "investigation": investigation,
            "pending": value.get("pending", list(context.state.pending)), "evidence": evidence,
            "evidence_basis": "source_snapshot", "runtime_state_verified": False}
