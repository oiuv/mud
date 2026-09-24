// 所有 AI 能力共用的 UDP 请求入口；业务状态与玩家输出由调用方负责。
#include <socket.h>

#ifndef AI_SERVER_HOST
#define AI_SERVER_HOST "127.0.0.1"
#endif
#ifndef AI_SERVER_PORT
#define AI_SERVER_PORT 9999
#endif
#define AI_MAX_PACKET 8192
#define AI_MAX_PENDING 256
#define AI_MAX_OWNER_PENDING 64

nosave private int socket_fd = -1;
nosave private int request_sequence;
nosave private int closing;
nosave private string instance_id;
nosave private mapping pending_requests = ([]);

void request_timeout(string requestId);
void retry_request(string requestId);

private mapping failure(string code, string message) {
    return ([ "type": "error", "code": code, "error": message ]);
}

private mapping take_request(string requestId) {
    mapping pending;

    pending = pending_requests[requestId];
    if (!mapp(pending))
        return 0;
    map_delete(pending_requests, requestId);
    if (pending["timeout"] > 0)
        remove_call_out(pending["timeout"]);
    if (pending["retry"] > 0)
        remove_call_out(pending["retry"]);
    return pending;
}

private int owner_alive(mapping pending) {
    return objectp(pending["owner"]) && objectp(function_owner(pending["callback"])) && (!functionp(pending["validator"]) || objectp(function_owner(pending["validator"])));
}

private void finish_request(string requestId, mapping response) {
    mapping pending;
    mixed err;

    // 回调可以提交新请求或抛出异常，因此必须先释放容量和定时器。
    pending = take_request(requestId);
    if (!mapp(pending) || !owner_alive(pending))
        return;
    response["request_id"] = requestId;
    err = catch(evaluate(pending["callback"], response));
    if (err)
        debug_message("AI客户端: 业务回调异常");
}

private int ensure_socket() {
    mixed *status;

    if (closing)
        return 0;
    if (socket_fd >= 0) {
        status = socket_status(socket_fd);
        if (arrayp(status) && sizeof(status) >= 6 && status[5] == this_object()) {
            if (status[1] == "BOUND" && status[2] == "DATAGRAM")
                return 1;
            socket_close(socket_fd);
        }
    }
    // UDP 没有关闭回调；驱动遇到读错误后可能已回收原 fd。
    socket_fd = socket_create(DATAGRAM, "read_callback");
    if (socket_fd < 0) {
        debug_message("AI客户端: 无法创建socket");
        return 0;
    }
    if (socket_bind(socket_fd, 0) < 0) {
        socket_close(socket_fd);
        socket_fd = -1;
        debug_message("AI客户端: 无法绑定socket");
        return 0;
    }
    return 1;
}

void create() {
    seteuid(getuid(this_object()));
    instance_id = sprintf("%d-%d", time(), random(1000000000));
    ensure_socket();
}

varargs mapping send_request(
    string requestType,
    mapping payload,
    function callback,
    mapping options
) {
    mapping request, pending;
    object owner;
    string requestId, jsonStr, key;
    mixed err, value;
    int timeout, retryDelay, retries, count, result;

    if (closing || !ensure_socket())
        return failure("unavailable", "AI服务通信未初始化。");
    owner = previous_object();
    if (!objectp(owner) || !functionp(callback) || !objectp(function_owner(callback)) ||
        !stringp(requestType) || requestType == "" || requestType == "error" ||
        sizeof(requestType) > 64 || !mapp(payload) ||
        !undefinedp(payload["type"]) || !undefinedp(payload["request_id"]))
        return failure("invalid_request", "AI请求参数无效。");
    if (!options)
        options = ([]);
    foreach (key, value in options) {
        if (member_array(key, ({ "timeout", "retry_delay", "retries", "validator" })) == -1)
            return failure("invalid_request", "未知AI请求选项。");
    }
    timeout = undefinedp(options["timeout"]) ? 90 : options["timeout"];
    retryDelay = undefinedp(options["retry_delay"]) ? 5 : options["retry_delay"];
    retries = undefinedp(options["retries"]) ? 1 : options["retries"];
    if (!intp(timeout) || timeout < 1 || timeout > 300 ||
        !intp(retryDelay) || retryDelay < 1 || retryDelay > 60 ||
        !intp(retries) || retries < 0 || retries > 2 ||
        (!undefinedp(options["validator"]) && (!functionp(options["validator"]) ||
            !objectp(function_owner(options["validator"])))))
        return failure("invalid_request", "AI请求选项超出范围。");

    foreach (key in keys(pending_requests)) {
        pending = pending_requests[key];
        if (!owner_alive(pending))
            take_request(key);
        else if (pending["owner"] == owner)
            count++;
    }
    if (sizeof(pending_requests) >= AI_MAX_PENDING || count >= AI_MAX_OWNER_PENDING)
        return failure("busy", "AI正在忙碌，请稍后再试。");
    requestId = sprintf("%s-%d", instance_id, ++request_sequence);
    request = payload + ([ "type": requestType, "request_id": requestId ]);
    err = catch(jsonStr = json_encode(request));
    if (err)
        return failure("invalid_request", "AI请求无法编码。");
    if (sizeof(string_encode(jsonStr, "UTF-8")) > AI_MAX_PACKET)
        return failure("too_large", "提问和情境信息过长，请缩短后再试。");
    pending = ([
        "owner": owner, "callback": callback, "validator": options["validator"],
        "type": requestType, "payload": jsonStr, "deadline": time() + timeout,
        "retry_delay": retryDelay, "retries": retries
    ]);
    pending_requests[requestId] = pending;
    err = catch {
        pending["timeout"] = call_out("request_timeout", timeout, requestId);
        if (retries && retryDelay < timeout)
            pending["retry"] = call_out("retry_request", retryDelay, requestId);
    };
    if (err || pending["timeout"] <= 0) {
        take_request(requestId);
        return failure("unavailable", "AI请求无法排期。");
    }
    result = socket_write(socket_fd, jsonStr, AI_SERVER_HOST + " " + AI_SERVER_PORT);
    if (result < 0) {
        take_request(requestId);
        return failure("unavailable", "AI服务通信异常，请稍后再试。");
    }
    return ([ "request_id": requestId ]);
}

int cancel_request(string requestId) {
    mapping pending;

    pending = pending_requests[requestId];
    if (!mapp(pending) || pending["owner"] != previous_object())
        return 0;
    take_request(requestId);
    return 1;
}

int query_pending_count() {
    return sizeof(pending_requests);
}

void retry_request(string requestId) {
    mapping pending;

    pending = pending_requests[requestId];
    if (!mapp(pending))
        return;
    pending["retry"] = 0;
    if (!owner_alive(pending)) {
        take_request(requestId);
        return;
    }
    if (time() >= pending["deadline"] || pending["retries"] <= 0 || !ensure_socket())
        return;
    socket_write(socket_fd, pending["payload"], AI_SERVER_HOST + " " + AI_SERVER_PORT);
    pending["retries"]--;
    if (pending["retries"] && time() + pending["retry_delay"] < pending["deadline"])
        pending["retry"] = call_out("retry_request", pending["retry_delay"], requestId);
}

void request_timeout(string requestId) {
    finish_request(requestId, failure("timeout", "AI暂时没有回应，请稍后重新提问。"));
}

void read_callback(int fd, mixed message, string addr) {
    mapping response, pending;
    string requestId;
    mixed err, accepted;

    if (fd != socket_fd || addr != AI_SERVER_HOST + " " + AI_SERVER_PORT ||
        !stringp(message) || sizeof(string_encode(message, "UTF-8")) > AI_MAX_PACKET)
        return;
    err = catch(response = json_decode(message));
    if (err || !mapp(response) || !stringp(response["request_id"]))
        return;
    requestId = response["request_id"];
    pending = pending_requests[requestId];
    if (!mapp(pending))
        return;
    if (!owner_alive(pending)) {
        take_request(requestId);
        return;
    }
    if (time() >= pending["deadline"]) {
        request_timeout(requestId);
        return;
    }
    if (response["type"] != pending["type"] && response["type"] != "error")
        return;
    if (functionp(pending["validator"])) {
        err = catch(accepted = evaluate(pending["validator"], response));
        if (err || !accepted)
            return;
    }
    finish_request(requestId, response);
}

varargs string send_chat_request(string npcId, string playerId, string playerName,
    string message, string context) {
    return AI_NPC_D->send_chat_request(
        npcId,
        playerId,
        playerName,
        message,
        context,
        previous_object()
    );
}

void remove() {
    string requestId;

    closing = 1;
    if (socket_fd >= 0)
        socket_close(socket_fd);
    socket_fd = -1;
    foreach (requestId in keys(pending_requests))
        finish_request(requestId, failure("unavailable", "AI通信服务已重载，请重新提问。"));
}
