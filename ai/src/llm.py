"""Shared text-model calls. Business code supplies prompts, deadlines and output limits."""
import logging
import math
import time
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
    if client is None:
        raise ModelUnavailable("unconfigured")
    limit = settings.chat_timeout if timeout is None else timeout
    token_limit = settings.max_tokens if max_tokens is None else max_tokens
    if type(token_limit) is not int or token_limit <= 0:
        raise ValueError("max_tokens must be positive")
    started = time.monotonic()
    effective_timeout = 0.0
    host = urlsplit(settings.chat_base_url).hostname
    input_chars = sum(len(message.get("content", "")) for message in messages)
    failure_code = "api_error"
    try:
        effective_timeout = remaining_timeout(limit, deadline)
        call_deadline = started + effective_timeout
        completion = client.with_options(timeout=effective_timeout).chat.completions.create(
            model=settings.chat_model, messages=messages, max_tokens=token_limit,
            extra_body=settings.chat_extra_body or None,
        )
        if time.monotonic() >= call_deadline:
            raise TimeoutError("AI request deadline exceeded")
        if completion.choices[0].finish_reason == "length":
            failure_code = "truncated"
            raise ValueError("Truncated completion")
        content = completion.choices[0].message.content
        if not isinstance(content, str) or not content.strip():
            failure_code = "empty"
            raise ValueError("Empty completion")
        logger.info(
            "Model completion succeeded: operation=%s model=%s host=%s "
            "elapsed_s=%.2f input_chars=%d output_chars=%d",
            operation, settings.chat_model, host, time.monotonic() - started,
            input_chars, len(content),
        )
        if usage_callback is not None:
            usage = getattr(completion, "usage", None)
            usage_callback({key: getattr(usage, key) for key in
                            ("prompt_tokens", "completion_tokens", "total_tokens")
                            if type(getattr(usage, key, None)) is int and getattr(usage, key) >= 0})
        return content.strip()
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
