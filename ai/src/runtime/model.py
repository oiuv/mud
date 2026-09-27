"""Chat request lifecycle shared by single-shot and tool-loop Agents."""
from dataclasses import replace
import logging

from ..llm import ModelResponse, ModelUnavailable
from .contracts import RuntimeFault, json_text
from .lifecycle import Operation
from .usage import UsageCall, usage_known
from .window import TokenMeter, model_window


logger = logging.getLogger(__name__)


def call_model(model, messages, definitions, agent, context, hooks, validate_messages, *, compactor=None,
               meter=None, metadata=None, usage_record=None):
    prefix = messages[:len(messages) - len(compactor.history)] if compactor is not None else []
    try:
        return _call_once(model, messages, definitions, agent, context, hooks, validate_messages,
                          compactor, meter, metadata, usage_record)
    except ModelUnavailable as error:
        # Only a provider-classified context error gets one different recovery
        # path. Ordinary HTTP 400, timeout or truncation must not be replayed here.
        if error.code != "context_window_exceeded" or compactor is None:
            raise
        context.check()
        context.state.token_meter.anchor = None
        return _call_once(model, prefix + list(compactor.history), definitions, agent, context,
                          hooks, validate_messages, compactor, meter, metadata, usage_record, force=True)


def _call_once(model, messages, definitions, agent, context, hooks, validate_messages,
               compactor, meter, metadata, usage_record, *, force=False):
    meter = meter or context.state.token_meter
    with Operation(hooks, context, "model", operation=agent.operation, **(metadata or {})) as operation:
        validate_messages(messages, context)
        external = bool(getattr(model, "external", True))
        if external and not context.external_model:
            raise RuntimeFault("model_egress_denied")
        changed = operation.before({"messages": messages})
        additions = [{"role": "user", "content": item["text"]}
                     for item in changed.get("additional_context", [])]
        request_messages = list(messages) + additions
        if compactor is not None:
            def summarize(prompt, max_tokens, prompt_hash, record):
                return call_model(model, prompt, [], replace(agent, operation="compact", max_tokens=max_tokens,
                                                            json_output=False),
                                  context, hooks, validate_messages, meter=TokenMeter(), usage_record=record,
                                  metadata={"compact_prompt_hash": prompt_hash})
            request_messages = compactor.prepare(model, list(messages), additions, definitions,
                                                  agent, context, summarize, force=force)
        input_bytes = validate_messages(request_messages, context)
        input_bytes += len(json_text(definitions, None).encode("utf-8"))
        window = model_window(model)
        size = meter.measure(model, request_messages, definitions, agent.max_tokens, json_output=agent.json_output)
        operation.metadata.update(context_tokens_estimated=size.input_tokens,
                                  context_window_tokens=size.window_tokens,
                                  reserved_output_tokens=size.output_tokens,
                                  token_estimation=size.method)
        window.require_fit(size)
        context.budget.reserve(context.deadline, model_calls=1, external_calls=int(external), total_bytes=input_bytes)
        operation.start()
        receipt = UsageCall(context, agent.operation, getattr(getattr(model, "settings", None),
                            "chat_model", "unknown"), record=usage_record)
        try:
            with receipt:
                options = {"usage_callback": receipt.receive} if getattr(model, "accounts_usage", False) else {}
                if agent.json_output:
                    options["json_output"] = True
                response = model(request_messages, context=context, tools=definitions, operation=agent.operation,
                                 timeout=agent.timeout, max_tokens=agent.max_tokens, **options)
                if not isinstance(response, ModelResponse):
                    raise RuntimeFault("invalid_model_response")
                receipt.receive(response.usage)
                meter.observe(model, request_messages, definitions, agent.max_tokens, response.usage,
                              json_output=agent.json_output)
                context.check()
                if (not isinstance(response.text, str) or
                        (response.reasoning_content is not None and not isinstance(response.reasoning_content, str))):
                    raise RuntimeFault("invalid_model_response")
                diagnostic = getattr(model, "record_reasoning", None)
                if callable(diagnostic):
                    try:
                        diagnostic(response, context=context, metadata=operation.metadata)
                    except Exception as error:
                        logger.warning("Model reasoning observation failed: error=%s", type(error).__name__)
                output = {"text": response.text, "reasoning_content": response.reasoning_content,
                          "calls": [vars(call) for call in response.tool_calls]}
                # Business/UDP sizes are separate from the raw model response.
                output_bytes = len(json_text(output, None).encode("utf-8"))
                context.budget.reserve(context.deadline, total_bytes=output_bytes)
                operation.data = {"text": response.text}
        finally:
            operation.metadata.update(usage=receipt.usage, usage_known=usage_known(receipt.usage),
                                      model=receipt.model)
    context.check()
    return response
