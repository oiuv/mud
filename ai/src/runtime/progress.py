"""Request-local loop protection based on observations, never private reasoning."""
import hashlib
import json

from .contracts import RuntimeFault, parse_json


def fingerprint(value):
    encoded = json.dumps(value, ensure_ascii=False, allow_nan=False,
                         sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def observation(name, arguments, reply):
    """Keep effective arguments and facts; discard only known envelope metadata.

    Evidence IDs/read times identify observations, not new facts. Other fields,
    including content, hash, line ranges and domain IDs, remain significant.
    """
    if isinstance(arguments, str):
        try:
            arguments = parse_json(arguments, 65536)
        except RuntimeFault:
            pass  # Invalid arguments still consume the existing hard budget.
    value = reply.get("value")
    if isinstance(value, dict) and isinstance(value.get("evidence"), list):
        value = dict(value, evidence=[
            {key: item for key, item in record.items() if key not in ("id", "read_at")}
            if isinstance(record, dict) else record for record in value["evidence"]])
        # Retrieval ranking/order is not evidence novelty.
        value["evidence"] = sorted(value["evidence"], key=fingerprint)
    material = {"ok": reply.get("ok"), "value": value,
                "error": reply.get("error"), "status": reply.get("status")}
    return fingerprint([name, arguments]), fingerprint(material)


class Progress:
    """Bounded by the run's model/tool budgets; only hashes are retained here."""
    def __init__(self, limit):
        self.limit = limit
        self.repeated_rounds = 0
        self.observations = {}
        self.gaps = set()

    def tool(self, item):
        action, result = item
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
        if self.repeated_rounds >= self.limit:
            raise RuntimeFault("no_progress", "incomplete")
        return (f"连续 {self.repeated_rounds} 轮重复行动未取得进展（上限 {self.limit}）。"
                "请根据已有结果更换查询、入口或调查路径，或补齐完成检查指出的缺口；"
                "不要仅换调用编号或改写答案继续重复。确有阻碍时明确说明未完成事项。")
