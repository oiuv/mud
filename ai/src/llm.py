"""Shared text-model calls. Business code supplies prompts, deadlines and output limits."""
import logging
import math
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from urllib.parse import urlsplit

from openai import APITimeoutError, OpenAI

logger = logging.getLogger(__name__)


class ModelUnavailable(Exception):
    def __init__(self, code, *, status_code=None, retry_after=0):
        self.code = code
        self.status_code = status_code
        self.retry_after = retry_after
        super().__init__(code)


@dataclass(frozen=True)
class ToolCall:
    id: str
    name: str
    arguments: str


@dataclass(frozen=True)
class ModelResponse:
    text: str = ""
    tool_calls: tuple = ()
    finish_reason: str = "stop"
    usage: dict = field(default_factory=dict)


class ChatModel:
    """Runtime adapter; ownership of the client remains with the business assembly."""
    external = True
    accounts_usage = True

    def __init__(self, settings, client):
        self.settings = settings
        self.client = client

    def __call__(self, messages, *, context, tools, operation, timeout, max_tokens):
        return complete_model(self.settings, self.client, messages, context.deadline, max_tokens,
                              timeout=timeout, tools=tools, operation=operation,
                              usage_callback=context.budget.record_usage)


def remaining_timeout(timeout, deadline=None):
    if isinstance(timeout, bool) or not isinstance(timeout, (int, float)) or not math.isfinite(timeout) or timeout <= 0:
        raise ValueError("timeout must be positive and finite")
    if deadline is None:
        return timeout
    if isinstance(deadline, bool) or not isinstance(deadline, (int, float)) or not math.isfinite(deadline):
        raise ValueError("deadline must be finite")
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise TimeoutError("AI request deadline exceeded")
    return min(timeout, remaining)


def create_chat_client(settings):
    if not settings.chat_api_key or settings.chat_api_key.startswith("your-"):
        return None
    return OpenAI(api_key=settings.chat_api_key, base_url=settings.chat_base_url,
                  timeout=settings.chat_timeout, max_retries=0)


def complete_chat(settings, client, messages, deadline=None, max_tokens=None, *,
                  timeout=None, operation="chat", usage_callback=None):
    result = complete_model(settings, client, messages, deadline, max_tokens,
                            timeout=timeout, operation=operation, usage_callback=usage_callback)
    if result.tool_calls:
        raise ModelUnavailable("unexpected_tool_calls")
    return result.text


def complete_model(settings, client, messages, deadline=None, max_tokens=None, *,
                   timeout=None, operation="chat", usage_callback=None, tools=None):
    if client is None:
        raise ModelUnavailable("unconfigured")
    if tools and not settings.chat_supports_tools:
        raise ModelUnavailable("unsupported_tools")
    limit = settings.chat_timeout if timeout is None else timeout
    token_limit = settings.max_tokens if max_tokens is None else max_tokens
    if type(token_limit) is not int or token_limit <= 0:
        raise ValueError("max_tokens must be positive")
    started = time.monotonic()
    effective_timeout = 0.0
    host = urlsplit(settings.chat_base_url).hostname
    input_chars = sum(len(message.get("content") or "") for message in messages)
    failure_code = "api_error"
    try:
        effective_timeout = remaining_timeout(limit, deadline)
        call_deadline = started + effective_timeout
        options = {"tools": tools, "tool_choice": "auto"} if tools else {}
        completion = client.with_options(timeout=effective_timeout).chat.completions.create(
            model=settings.chat_model, messages=messages, max_tokens=token_limit,
            extra_body=settings.chat_extra_body or None,
            **options,
        )
        raw_usage = getattr(completion, "usage", None)
        usage = {key: getattr(raw_usage, key) for key in
                 ("prompt_tokens", "completion_tokens", "total_tokens")
                 if type(getattr(raw_usage, key, None)) is int and getattr(raw_usage, key) >= 0}
        # A late or invalid response still consumed provider resources.
        if usage_callback is not None:
            usage_callback(usage)
        if time.monotonic() >= call_deadline:
            raise TimeoutError("AI request deadline exceeded")
        choice = completion.choices[0]
        if choice.finish_reason == "length":
            failure_code = "truncated"
            raise ValueError("Truncated completion")
        raw_calls = getattr(choice.message, "tool_calls", None) or ()
        calls = []
        if not isinstance(raw_calls, (list, tuple)) or len(raw_calls) > 32:
            failure_code = "invalid_tools"
            raise ValueError("Invalid tool calls")
        for call in raw_calls:
            if (getattr(call, "type", None) != "function"
                    or not isinstance(call.id, str) or not 1 <= len(call.id) <= 128
                    or not isinstance(call.function.name, str) or not 1 <= len(call.function.name) <= 64
                    or not isinstance(call.function.arguments, str) or len(call.function.arguments) > 32768):
                failure_code = "invalid_tools"
                raise ValueError("Invalid tool call")
            calls.append(ToolCall(call.id, call.function.name, call.function.arguments))
        if calls and choice.finish_reason != "tool_calls":
            failure_code = "invalid_tools"
            raise ValueError("Conflicting stop reason")
        if not calls and choice.finish_reason not in ("stop", None):
            failure_code = "invalid_finish"
            raise ValueError("Missing final response")
        content = choice.message.content or ""
        if not isinstance(content, str) or (not calls and not content.strip()):
            failure_code = "empty"
            raise ValueError("Empty completion")
        logger.info(
            "Model completion succeeded: operation=%s model=%s host=%s "
            "elapsed_s=%.2f input_chars=%d output_chars=%d",
            operation, settings.chat_model, host, time.monotonic() - started,
            input_chars, len(content),
        )
        return ModelResponse(content.strip(), tuple(calls), choice.finish_reason, usage)
    except Exception as error:
        # SDK exception strings and response bodies may contain credentials or prompts.
        logger.warning(
            "Model completion failed: operation=%s model=%s host=%s timeout_s=%.2f "
            "elapsed_s=%.2f input_chars=%d error=%s cause=%s status=%s",
            operation, settings.chat_model, host, effective_timeout, time.monotonic() - started,
            input_chars, type(error).__name__,
            type(error.__cause__).__name__ if error.__cause__ else "-",
            getattr(error, "status_code", None),
        )
        if isinstance(error, (APITimeoutError, TimeoutError)):
            failure_code = "timeout"
        retry_after = 0
        response = getattr(error, "response", None)
        value = response.headers.get("retry-after") if response is not None else None
        if value:
            try:
                retry_after = float(value)
            except (TypeError, ValueError):
                try:
                    retry_after = (parsedate_to_datetime(value) - datetime.now(timezone.utc)).total_seconds()
                except (TypeError, ValueError, OverflowError):
                    pass
            if not math.isfinite(retry_after) or retry_after < 0:
                retry_after = 0
        raise ModelUnavailable(failure_code, status_code=getattr(error, "status_code", None),
                               retry_after=retry_after) from error
