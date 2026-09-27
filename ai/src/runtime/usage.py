"""Provider usage normalization and one settlement per dispatched model call."""
from .contracts import RuntimeFault

TOKEN_FIELDS = ("prompt_tokens", "completion_tokens", "total_tokens", "cached_prompt_tokens")


def field(value, name):
    return value.get(name) if isinstance(value, dict) else getattr(value, name, None)


def normalize_usage(raw, kind="chat"):
    """Missing provider fields stay missing; cached input is a subset of input."""
    usage = {key: field(raw, key) for key in TOKEN_FIELDS
             if type(field(raw, key)) is int and field(raw, key) >= 0}
    cached = field(field(raw, "prompt_tokens_details"), "cached_tokens")
    if type(cached) is int and cached >= 0:
        usage["cached_prompt_tokens"] = cached
    if kind in ("embedding", "rerank"):
        # These endpoints do not generate text tokens. Native rerank reports
        # input_tokens (or total_tokens), unlike the compatible embedding API.
        if "prompt_tokens" not in usage:
            tokens = field(raw, "input_tokens")
            if type(tokens) is not int or tokens < 0:
                tokens = usage.get("total_tokens")
            if type(tokens) is int and tokens >= 0:
                usage["prompt_tokens"] = tokens
        if "prompt_tokens" in usage:
            usage["completion_tokens"] = 0
            usage.setdefault("total_tokens", usage["prompt_tokens"])
    if ("cached_prompt_tokens" in usage and "prompt_tokens" in usage
            and usage["cached_prompt_tokens"] > usage["prompt_tokens"]):
        del usage["cached_prompt_tokens"]
    return usage


def usage_known(usage):
    return all(key in usage for key in TOKEN_FIELDS[:3])


class UsageCall:
    """Call-local receipt; never infer this call's usage from shared counters."""
    def __init__(self, context, operation, model="unknown", kind="chat", record=None):
        self.context, self.operation = context, operation
        self.model, self.kind, self.record = model, kind, record
        self.usage = {}

    def receive(self, raw):
        self.usage = normalize_usage(raw, self.kind)

    def __enter__(self):
        return self

    def __exit__(self, error_type, error, traceback):
        if isinstance(error, KeyboardInterrupt) or (isinstance(error, RuntimeFault) and error.status == "cancelled"):
            status = "cancelled"
        elif isinstance(error, TimeoutError) or getattr(error, "code", "") in ("timeout", "deadline"):
            status = "timeout"
        else:
            status = "failed" if error else "completed"
        context = self.context
        context.budget.record_usage(self.usage, model=self.model, kind=self.kind,
                                    operation=self.operation, agent=context.agent_id,
                                    role="child" if context.delegation_depth else "primary", status=status)
        if self.record is not None:
            self.record["model_calls"] += 1
            self.record["usage_incomplete_calls"] = (self.record.get("usage_incomplete_calls", 0)
                                                     + int(not usage_known(self.usage)))
            totals = self.record.setdefault("usage", {})
            for key, value in self.usage.items():
                totals[key] = totals.get(key, 0) + value
        return False
