"""Budget and observation boundary for non-chat model requests."""
from .contracts import RuntimeFault, json_text
from .hooks import Hooks
from .lifecycle import Operation
from .usage import UsageCall, usage_known


def remote_call(kind, payload, invoke, context=None, hooks=None, *, model="unknown",
                read_usage=None, validate=None):
    """Trusted indexing may omit a context; Agent retrieval must always supply one.

    Retrieval hooks can veto requests, but cannot rewrite already-authorized
    documents. Chat prompt intervention is handled by Runner instead.
    """
    if context is None:
        result = invoke()
        return validate(result) if validate else result
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
        receipt = UsageCall(context, kind, model, kind)
        try:
            with receipt:
                result = invoke()
                receipt.receive(read_usage(result) if read_usage else getattr(result, "usage", None))
                context.check()
                return validate(result) if validate else result
        finally:
            operation.metadata.update(usage=receipt.usage, usage_known=usage_known(receipt.usage), model=model)
