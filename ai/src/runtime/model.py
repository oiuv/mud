"""Chat request lifecycle shared by single-shot and tool-loop Agents."""
from ..llm import ModelResponse
from .contracts import RuntimeFault, json_text
from .lifecycle import Operation


def call_model(model, messages, definitions, agent, context, hooks, validate_messages):
    with Operation(hooks, context, "model", operation=agent.operation) as operation:
        validate_messages(messages, context)
        external = bool(getattr(model, "external", True))
        if external and not context.external_model:
            raise RuntimeFault("model_egress_denied")
        changed = operation.before({"messages": messages})
        request_messages = list(messages)
        for item in changed.get("additional_context", []):
            request_messages.append({"role": "user", "content": item["text"]})
        input_bytes = validate_messages(request_messages, context)
        input_bytes += len(json_text(definitions, context.budget.limits.context_bytes).encode("utf-8"))
        if input_bytes > context.budget.limits.context_bytes:
            raise RuntimeFault("context_limit", "incomplete")
        context.budget.reserve(context.deadline, model_calls=1, external_calls=int(external), total_bytes=input_bytes)
        operation.start()
        response = model(request_messages, context=context, tools=definitions, operation=agent.operation,
                         timeout=agent.timeout, max_tokens=agent.max_tokens)
        if not isinstance(response, ModelResponse):
            raise RuntimeFault("invalid_model_response")
        if not getattr(model, "accounts_usage", False):
            context.budget.record_usage(response.usage)
        context.check()
        if not isinstance(response.text, str):
            raise RuntimeFault("invalid_model_response")
        output = {"text": response.text, "calls": [vars(call) for call in response.tool_calls]}
        output_bytes = len(json_text(output, context.budget.limits.output_bytes).encode("utf-8"))
        context.budget.reserve(context.deadline, total_bytes=output_bytes)
        operation.data = {"text": response.text}
    context.check()
    return response
