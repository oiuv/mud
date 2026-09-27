"""Request-local delivery of settled results, not a database or model tool."""
import hashlib
import threading
import uuid
from collections import OrderedDict
from dataclasses import dataclass

from .contracts import RuntimeFault, json_text, parse_json


def owner(context):
    return (context.root_id, context.actor, context.audience, context.session)


def permits(policy, producer):
    """A delivery reference never grants the producer's broader read authority."""
    effective = producer.intersect(policy)
    return all(getattr(effective, name) == getattr(producer, name) for name in (
        "tools", "skills", "scopes", "egress_scopes", "agents", "knowledge_paths"))


@dataclass(frozen=True)
class StoredResult:
    owner: tuple
    source: str
    policy: object
    external_model: bool
    encoded: str
    digest: str


class Results:
    """Bound retained artifacts, not task iterations. Old references may expire.

    Only trusted business code publishes results. Nothing here is exposed as a
    write Tool, path, download URL or cross-request lookup service.
    """
    def __init__(self, max_items=128, max_bytes=1_048_576):
        if type(max_items) is not int or max_items < 1 or type(max_bytes) is not int or max_bytes < 1:
            raise ValueError("Invalid retained result capacity")
        self.max_items, self.max_bytes = max_items, max_bytes
        self._records = OrderedDict()
        self._bytes = 0
        self._lock = threading.RLock()
        self._closed = False

    def publish(self, outcome):
        """A model saying completed is insufficient: Runner must have settled it."""
        context, result = outcome.context, outcome.result
        context.check()
        if (not outcome.finalized or context.state.pending_commit is not None
                or context.state.terminal is not result or result.status != "completed"
                or outcome.agent is None):
            raise RuntimeFault("result_not_committed")
        value = outcome.agent.outputs.validate(result.value, context.budget.limits.output_bytes)
        if hashlib.sha256(json_text(result.value).encode("utf-8")).hexdigest() != context.state.terminal_digest:
            raise RuntimeFault("result_changed")
        return self._save(context, outcome.agent.name, value, context.state.evidence)

    def _save(self, context, source, value, evidence):
        """Internal entry also used after a business has verified its durable cache."""
        context.check()
        if source not in context.policy.agents:
            raise RuntimeFault("result_denied")
        encoded = self.pack(value, evidence)
        size = len(encoded.encode("utf-8"))
        if size > self.max_bytes:
            raise RuntimeFault("result_too_large")
        digest = hashlib.sha256(encoded.encode("utf-8")).hexdigest()
        with self._lock:
            if self._closed:
                raise RuntimeFault("result_expired")
            # Repeated delivery of identical settled data needs no second entry.
            for ref, record in self._records.items():
                if (record.owner == owner(context) and record.source == source and record.digest == digest
                        and permits(record.policy, context.policy) and permits(context.policy, record.policy)
                        and record.external_model == context.external_model):
                    return ref
            while self._records and (len(self._records) >= self.max_items or self._bytes + size > self.max_bytes):
                _, expired = self._records.popitem(last=False)
                self._bytes -= len(expired.encoded.encode("utf-8"))
            ref = "result:" + uuid.uuid4().hex
            self._records[ref] = StoredResult(owner(context), source, context.policy,
                                              context.external_model, encoded, digest)
            self._bytes += size
            return ref

    @staticmethod
    def pack(value, evidence):
        """Bounded cache projection. Packing alone does not certify completion."""
        # Keep only cited provenance, never all search material/tool history.
        cited = set()
        if isinstance(value, dict):
            for claim in value.get("claims", []):
                cited.update(claim.get("evidence", []))
            investigation = value.get("investigation") or {}
            cited.update(investigation.get("entry", []))
        provenance = {}
        for key in sorted(cited):
            record = evidence.get(key)
            if not isinstance(record, dict):
                raise RuntimeFault("invalid_result_evidence")
            provenance[key] = {name: record[name] for name in (
                "id", "origin", "scope", "path", "start", "end", "start_column", "end_column",
                "hash", "revision", "read_at") if name in record}
        return json_text({"value": value, "evidence": provenance}, 65536)

    def restore(self, context, source, encoded):
        """Trusted business only, AFTER durable success/identity/authority checks.

        Replays mint a reference in this root, never persist an old reference.
        This is deliberately not a model-visible or network operation.
        """
        record = parse_json(encoded, 65536)
        if (not isinstance(record, dict) or set(record) != {"value", "evidence"}
                or not isinstance(record["evidence"], dict)):
            raise RuntimeFault("invalid_cached_result")
        return self._save(context, source, record["value"], record["evidence"])

    def resolve(self, ref, context):
        context.check()
        with self._lock:
            record = self._records.get(ref) if isinstance(ref, str) else None
            if self._closed or record is None:
                raise RuntimeFault("result_expired")
            if (record.owner != owner(context) or record.source not in context.policy.agents
                    or not permits(context.policy, record.policy)
                    or (context.external_model and not record.external_model)):
                raise RuntimeFault("result_denied")
            if hashlib.sha256(record.encoded.encode("utf-8")).hexdigest() != record.digest:
                raise RuntimeFault("result_changed")
            return {"source": record.source, "status": "completed", **parse_json(record.encoded, 65536)}

    def close(self):
        with self._lock:
            self._closed = True
            self._records.clear()
            self._bytes = 0
