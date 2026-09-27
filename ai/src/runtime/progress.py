"""Request-local loop protection based on observations, never private reasoning."""
import hashlib
import json

from .contracts import RuntimeFault, parse_json


def fingerprint(value):
    encoded = json.dumps(value, ensure_ascii=False, allow_nan=False,
                         sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def source_facts(name, reply):
    """Line identities for progress only, never authority or answer validation.

    A read covers later search hits; a search does not replace a verified read.
    An empty search can guide a new query, but adds no usable source evidence.
    Other tools keep their existing argument/result observation semantics.
    """
    if name not in ("source.read", "source.search", "exec") or not reply.get("ok"):
        return None
    value = reply.get("value")
    records = value.get("evidence") if isinstance(value, dict) else None
    if not isinstance(records, list):
        return None
    facts = set()
    for record in records:
        if (not isinstance(record, dict) or not isinstance(record.get("content"), str)
                or record.get("origin") not in ("source.read", "source.search")
                or type(record.get("start")) is not int or record["start"] < 1
                or not all(isinstance(record.get(key), str) for key in ("scope", "path", "hash"))):
            return None
        lines = record["content"].split("\n")
        if record.get("end") != record["start"] + len(lines) - 1:
            return None
        identity = [record[key] for key in ("scope", "path", "hash")] + [record.get("revision", "")]
        for offset, line in enumerate(lines):
            fact = fingerprint([identity, record["start"] + offset, line])
            facts.add(fact)
            if record["origin"] == "source.read":
                facts.add("read:" + fact)
    return frozenset(facts)


def observation(name, arguments, reply):
    """Keep effective arguments and facts; discard only known envelope metadata.

    Evidence IDs/read times identify observations, not new facts. Other fields,
    including content, hash, line ranges and domain IDs, remain significant.
    """
    if isinstance(arguments, str):
        try:
            arguments = parse_json(arguments, 65536)
        except RuntimeFault:
            pass  # Invalid arguments are still observable attempts.
    value = reply.get("value")
    if isinstance(value, dict) and isinstance(value.get("evidence"), list):
        value = dict(value, evidence=[
            {key: item for key, item in record.items() if key not in ("id", "read_at")}
            if isinstance(record, dict) else record for record in value["evidence"]])
        # Retrieval ranking/order is not evidence novelty.
        value["evidence"] = sorted(value["evidence"], key=fingerprint)
    material = {"ok": reply.get("ok"), "value": value,
                "error": reply.get("error"), "status": reply.get("status")}
    return fingerprint([name, arguments]), fingerprint(material), source_facts(name, reply)


class Progress:
    """Strategy feedback, not a fixed-count termination condition."""
    def __init__(self, limit):
        self.limit = limit
        self.repeated_rounds = 0
        self.observations = {}
        self.facts = set()
        self.gaps = set()

    def tool(self, item):
        action, result, facts = item
        if facts is not None:
            changed = bool(facts - self.facts)
            self.facts.update(facts)
            return changed
        changed = self.observations.get(action) != result
        self.observations[action] = result
        return changed

    def completion(self, gaps):
        current = frozenset(fingerprint(gap) for gap in gaps)
        improved = not self.gaps or (current not in self.gaps and
                                    any(current < previous for previous in self.gaps))
        self.gaps.add(current)
        return improved

    def finish_round(self, advanced):
        if advanced:
            self.repeated_rounds = 0
            return None
        self.repeated_rounds += 1
        return (f"连续 {self.repeated_rounds} 轮未增加可用证据或减少完成缺口。"
                "请先核对原目标：证据已足够则提交有依据的答案；仍有具体缺口才沿相关线索补查。"
                "换关键词重获已读内容、只换调用编号或改写答案不算新进展。"
                "这不是终止条件；确有资料或权限阻碍时如实说明未完成事项，不猜测也不强行收尾。")
