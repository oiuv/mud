"""Budget and observation boundary for non-chat model requests."""
from .contracts import RuntimeFault, json_text
from .hooks import Hooks
from .lifecycle import Operation


def remote_call(kind, payload, invoke, context=None, hooks=None):
    """Trusted indexing may omit a context; Agent retrieval must always supply one.

    Retrieval hooks can veto requests, but cannot rewrite already-authorized
    documents. Chat prompt intervention is handled by Runner instead.
    """
    if context is None:
        return invoke()
    with Operation(hooks or Hooks(), context, "model", operation=kind) as operation:
        context.check()
        if not context.external_model:
            raise RuntimeFault("model_egress_denied")
        changed = operation.before({"payload": payload})
        if changed.get("additional_context"):
            # Retrieval has a fixed query/document contract, not chat messages.
            raise RuntimeFault("retrieval_hook_changed")
        context.budget.reserve(context.deadline, external_calls=1,
                               total_bytes=len(json_text(payload).encode("utf-8")))
        operation.start()
        result = invoke()
        usage = getattr(result, "usage", None)
        if usage:
            context.budget.record_usage({key: getattr(usage, key, 0)
                                        for key in ("prompt_tokens", "completion_tokens", "total_tokens")})
        context.check()
        return result
