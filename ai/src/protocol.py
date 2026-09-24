"""Small shared UDP envelope; capability-specific fields belong to handlers."""
import json
import uuid

MAX_DATAGRAM = 8192


class RequestError(ValueError):
    def __init__(self, code, message):
        self.code = code
        super().__init__(message)


def error_response(request, code, message):
    response = {"type": "error", "code": code, "error": message}
    if isinstance(request, dict):
        # Optional legacy correlation fields; never required by the transport.
        for key in ("request_id", "npc_id", "player_id"):
            value = request.get(key)
            if isinstance(value, str):
                response[key] = value[:128].encode("utf-8", errors="replace").decode("utf-8")
    return response


def normalize_request(request):
    if not isinstance(request, dict):
        raise RequestError("invalid_request", "请求必须是JSON对象。")
    request = dict(request)
    request.setdefault("request_id", uuid.uuid4().hex)
    request.setdefault("type", "chat")
    for key, limit in (("request_id", 128), ("type", 64)):
        value = request[key]
        if not isinstance(value, str) or not value.strip() or len(value) > limit:
            raise RequestError("invalid_request", "缺少或无效的请求标识。")
    try:
        payload = json.dumps(request, ensure_ascii=False, allow_nan=False, sort_keys=True).encode("utf-8")
    except (TypeError, ValueError, UnicodeError, RecursionError) as error:
        raise RequestError("invalid_request", "请求格式错误。") from error
    if len(payload) > MAX_DATAGRAM:
        raise RequestError("too_large", "请求内容过长。")
    return request
