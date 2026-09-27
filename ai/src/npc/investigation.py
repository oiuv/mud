"""Evidence-backed candidate checks, not an LPC interpreter or semantic proof."""
import uuid
from dataclasses import replace

from ..runtime.context import Limits


SOURCE_TOOLS = frozenset(("source.search", "source.read"))
SOURCE_LIMITS = Limits(model_calls=12, external_calls=24, tool_calls=64, delegations=0, depth=0)
REFERENCES = {"type": "array", "maxItems": 10, "uniqueItems": True,
              "items": {"type": "string", "minLength": 1, "maxLength": 128}}
INVESTIGATION = {
    "type": "object", "required": ["subject", "phase", "entry"], "additionalProperties": False,
    "properties": {
        "subject": {"type": "string", "minLength": 1, "maxLength": 200},
        "phase": {"enum": ["learn", "perform", "unlock", "reward", "comparison", "other"]},
        "entry": REFERENCES,
    },
}


def source_policy(base, sources):
    """Source-capable agents share the deployment's one repository boundary."""
    granted = set(sources.scopes)
    if not granted:
        return base
    return replace(base, tools=base.tools | SOURCE_TOOLS | {"exec"}, skills=base.skills | {"source-investigation"},
                   scopes=base.scopes | granted,
                   egress_scopes=base.egress_scopes | granted,
                   version="repository-source-v2:" + sources.fingerprint(granted))


def evidence_reference_feedback(keys, evidence):
    """Identify invalid citations without discarding valid reads or rewriting claims."""
    feedback = []
    for key in sorted(set(keys)):
        clue = evidence.get(key)
        if clue is None:
            feedback.append("unknown_evidence_reference:" + key)
        elif clue.get("origin") == "source.search":
            read = next((item for item in evidence.values()
                         if item.get("origin") == "source.read"
                         and all(item.get(field) == clue.get(field) for field in ("scope", "path", "hash", "revision"))
                         and item["start"] <= clue["start"] <= clue["end"] <= item["end"]
                         and ("start_column" not in item or
                              ("start_column" in clue and item["start_column"] <= clue["start_column"]
                               and item["end_column"] >= clue["end_column"]))), None)
            feedback.append("replace_search_reference:" + key + "->" + read["id"] if read is not None
                            else "read_required_for_reference:" + key)
        elif clue.get("truncated") and clue.get("origin") != "source.read":
            feedback.append("partial_evidence_reference:" + key)
        if len(feedback) == 5:
            break
    if feedback:
        feedback.append("引用问题对应上述标识。先核对已有工具结果中的精确 ID；本次请求内较早取得的证据仍可引用，"
                        "source.read 的已返回行区间不因 truncated 标记而失效。仅缺少所需原文时补读；"
                        "不要猜测或改造 ID，结论仍须由所引片段支持。")
    return feedback


def verify_investigation(result, context, tools):
    """Check the evidence contract and re-read cited snapshots through the same tool boundary.

    Called for candidates and again after before_commit. There is intentionally
    no successful-check cache: a repeated tool call ID would reuse stale data.
    Claims/pending carry conclusions/gaps; no model-authored coverage checklist
    can prove that every relevant branch was found.
    """
    value, state = result.value, context.state
    ledger = value.get("investigation")
    used_source = any(item.get("origin") in SOURCE_TOOLS for item in state.evidence.values())
    if not used_source and ledger is None:
        return ()
    gaps, keys = [], set()
    if result.status == "completed" and "source-investigation" not in state.skills:
        gaps.append("source_skill_required")
    for claim in value["claims"]:
        keys.update(claim["evidence"])
    if result.status == "completed":
        if value["kind"] != "rules" or ledger is None:
            return (*gaps, "source_investigation_required")
        if not ledger["entry"]:
            gaps.append("source_entry_required")
    if ledger is not None:
        keys.update(ledger["entry"])
        # Entry must be grounded in source reads, not retrieval/search clues.
        if any(state.evidence.get(key, {}).get("origin") != "source.read" for key in ledger["entry"]):
            gaps.append("source_read_required")
    files = {}
    for key in sorted(keys):
        evidence = state.evidence.get(key)
        if evidence is None:
            gaps.append("unknown_evidence")
            continue
        if evidence.get("origin") not in SOURCE_TOOLS:
            continue
        if evidence["origin"] != "source.read":
            gaps.append("source_read_required")
            continue
        file = (evidence["scope"], evidence["path"])
        previous = files.get(file)
        if previous is not None and previous["hash"] != evidence["hash"]:
            gaps.append("source_mixed_versions")
        files[file] = evidence
    if result.status == "completed" and not files:
        gaps.append("source_read_required")
    if gaps:
        # Point to the incorrect citation, rather than sending the model back
        # through every file. This is guidance only: never rewrite its claims.
        gaps.extend(evidence_reference_feedback(keys, state.evidence))
        return tuple(sorted(set(gaps)))
    for evidence in files.values():
        # One whole-file hash check per cited file suffices for all its ranges.
        args = {key: evidence[key] for key in ("path", "start", "end")}
        args.update({key: evidence[key] for key in ("start_column", "end_column") if key in evidence})
        args["expected_hash"] = evidence["hash"]
        reply = tools.execute("source.read", args, context, "verify-" + uuid.uuid4().hex)
        if not reply["ok"]:
            gaps.append("source_recheck:" + reply["error"])
            continue
        current = reply["value"]["evidence"]
        # Hooks may narrow arguments, but must not silently substitute evidence.
        if (len(current) != 1 or any(current[0].get(key) != evidence.get(key)
                                    for key in ("scope", "path", "start", "end", "start_column", "end_column",
                                                "hash", "content", "revision"))):
            gaps.append("source_recheck_mismatch")
    return tuple(sorted(set(gaps)))
