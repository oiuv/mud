"""Model-bound context sizing; estimates are not provider billing token counts.

Without a deployment-specific tokenizer, use a conservative UTF-8 byte fallback
plus explicit message/tool framing allowances. This deliberately overestimates
Chinese and most natural language; it must never be reported as exact usage.
Actual prompt/completion usage still comes from the provider response.
"""
import hashlib
from dataclasses import dataclass, replace

from .contracts import RuntimeFault, json_text

DEFAULT_CONTEXT_WINDOW_TOKENS = 1_000_000


@dataclass(frozen=True)
class ContextSize:
    input_tokens: int
    output_tokens: int
    safety_tokens: int
    window_tokens: int
    method: str = "utf8_conservative_v1"

    @property
    def fits(self):
        return self.input_tokens + self.output_tokens + self.safety_tokens <= self.window_tokens

    @property
    def needs_compaction(self):
        return self.input_tokens * 5 >= self.window_tokens * 4 or not self.fits


@dataclass(frozen=True)
class ModelWindow:
    tokens: int = DEFAULT_CONTEXT_WINDOW_TOKENS

    def __post_init__(self):
        if type(self.tokens) is not int or self.tokens <= 0:
            raise ValueError("OPENAI_CONTEXT_WINDOW_TOKENS must be a positive integer")

    @property
    def safety_tokens(self):
        # Reserve framing uncertainty independently of the requested output.
        return max(64, (self.tokens + 99) // 100)

    def validate_output(self, max_tokens):
        if (type(max_tokens) is not int or max_tokens <= 0
                or max_tokens + self.safety_tokens >= self.tokens):
            raise ValueError("Model context window must leave room beyond max_tokens and safety margin")

    def measure(self, messages, definitions, max_tokens, *, json_output=False):
        self.validate_output(max_tokens)
        # Serialize every field, including assistant tool arguments, tool IDs,
        # descriptions/schemas and Hook additions, not only message.content.
        request = {"messages": messages, "tools": definitions}
        if json_output:
            request["response_format"] = {"type": "json_object"}
        encoded = json_text(request, None)
        estimated = len(encoded.encode("utf-8")) + 64 + 32 * len(messages) + 64 * len(definitions)
        return ContextSize(estimated, max_tokens, self.safety_tokens, self.tokens)

    def require_fit(self, size):
        if not size.fits:
            raise RuntimeFault("context_window_exceeded", "incomplete")


def model_window(model):
    """The selected model adapter owns its capacity; never read a global env here."""
    return ModelWindow(getattr(model, "context_window_tokens", DEFAULT_CONTEXT_WINDOW_TOKENS))


def model_output_tokens(model, max_tokens, *, json_output=False):
    """JSON is uncapped at the provider; reserve its declared maximum output."""
    return getattr(model, "max_output_tokens", max_tokens) if json_output else max_tokens


def _digest(value):
    return hashlib.sha256(json_text(value, None).encode("utf-8")).hexdigest()


class TokenMeter:
    """A run-local provider input anchor plus conservative, unsent-prefix growth.

    Only an unchanged request prefix with the same model binding and tool schemas
    can reuse an anchor. Changed instructions, compaction, or a model switch must
    be measured afresh. Cached input is already part of prompt_tokens; completion
    usage and the cumulative billing ledger are not active-context measurements.
    """

    def __init__(self):
        self.anchor = None

    @staticmethod
    def _binding(model):
        return (id(model), getattr(model, "context_identity", None), model_window(model).tokens)

    def measure(self, model, messages, definitions, max_tokens, *, json_output=False):
        reserve = model_output_tokens(model, max_tokens, json_output=json_output)
        size = model_window(model).measure(messages, definitions, reserve, json_output=json_output)
        anchor = self.anchor
        if (anchor is not None and anchor["binding"] == self._binding(model)
                and anchor["tools"] == _digest(definitions)
                and anchor["json_output"] == json_output
                and len(messages) >= anchor["count"]
                and _digest(messages[:anchor["count"]]) == anchor["prefix"]):
            delta = max(0, size.input_tokens - anchor["estimated"])
            return replace(size, input_tokens=anchor["tokens"] + delta,
                           method="provider_anchor_utf8_delta_v1")
        return size

    def observe(self, model, messages, definitions, max_tokens, usage, *, json_output=False):
        tokens = usage.get("prompt_tokens") if isinstance(usage, dict) else None
        self.anchor = None
        if type(tokens) is not int or tokens <= 0:
            return
        reserve = model_output_tokens(model, max_tokens, json_output=json_output)
        self.anchor = {"binding": self._binding(model), "tools": _digest(definitions), "json_output": json_output,
                       "count": len(messages), "prefix": _digest(messages), "tokens": tokens,
                       "estimated": model_window(model).measure(
                           messages, definitions, reserve, json_output=json_output).input_tokens}
