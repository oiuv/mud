// AI客户端：关联请求、超时提醒、一次重传，不依赖AI角色ID查找NPC对象。
#include <socket.h>
inherit F_DBASE;

#define AI_SERVER_HOST "127.0.0.1"
#define AI_SERVER_PORT 9999
#define AI_REQUEST_TIMEOUT 90
#define AI_MAX_PACKET 8192

nosave private int socket_fd = -1;
nosave private int requestSequence = 0;
nosave private string instanceId;
nosave private mapping pending_requests = ([]);

void requestTimeout(string requestId);
void retryRequest(string requestId);
void showPending(string requestId, string npcName);

void create()
{
    seteuid(getuid(this_object()));
    instanceId = sprintf("%d-%d", time(), random(1000000000));
    socket_fd = socket_create(DATAGRAM, "read_callback");
    if (socket_fd < 0)
    {
        debug_message("AI客户端: 无法创建socket");
        return;
    }
    if (socket_bind(socket_fd, 0) < 0)
    {
        socket_close(socket_fd);
        socket_fd = -1;
        debug_message("AI客户端: 无法绑定socket");
    }
}

varargs string send_chat_request(string npcId, string playerId, string playerName,
                                string message, string context)
{
    mapping request, pending;
    string requestId, jsonStr, key, error, npcName;
    object player, npc;
    int result;

    player = find_player(playerId);
    if (!objectp(player))
        return "玩家已离线";
    if (socket_fd < 0)
        error = "AI服务通信未初始化。";
    else if (!stringp(message) || message == "" || sizeof(message) > 1000)
        error = "提问不能为空且不能超过1000字。";
    else if (sizeof(pending_requests) >= 64)
        error = "AI正在忙碌，请稍后再试。";
    if (error)
    {
        tell_object(player, error + "\n");
        return error;
    }
    foreach (key in keys(pending_requests))
    {
        pending = pending_requests[key];
        if (pending["player_id"] == playerId && pending["npc_id"] == npcId)
        {
            tell_object(player, "这位NPC还在思考你上一个问题，请稍候。\n");
            return "处理中...";
        }
    }
    requestId = sprintf("%s-%d", instanceId, ++requestSequence);
    request = ([
        "type": "chat", "request_id": requestId,
        "npc_id": npcId, "player_id": playerId, "player_name": playerName,
        "message": message, "context": context || "无"
    ]);
    jsonStr = json_encode(request);
    if (sizeof(string_encode(jsonStr, "UTF-8")) > AI_MAX_PACKET)
    {
        tell_object(player, "提问和情境信息过长，请缩短后再试。\n");
        return "请求过长";
    }
    result = socket_write(socket_fd, jsonStr, AI_SERVER_HOST + " " + AI_SERVER_PORT);
    if (result < 0)
    {
        tell_object(player, "AI服务通信异常，请稍后再试。\n");
        return "AI服务通信异常";
    }
    pending_requests[requestId] = ([
        "player": player, "player_id": playerId, "npc_id": npcId, "payload": jsonStr,
        "timeout": call_out("requestTimeout", AI_REQUEST_TIMEOUT, requestId),
        "retry": call_out("retryRequest", 5, requestId)
    ]);
    npc = previous_object();
    if (objectp(npc) && function_exists("query_shadow_now", npc))
        npc = npc->query_shadow_now();
    npcName = "对方";
    if (objectp(npc) && function_exists("name", npc))
        npcName = npc->name();
    if (!stringp(npcName) || npcName == "")
        npcName = "对方";
    // 等命令先显示玩家提问，再提示等待；自动重传不重复提示。
    call_out("showPending", 0, requestId, npcName);
    return "处理中...";
}

void showPending(string requestId, string npcName)
{
    mapping pending;
    object player;

    pending = pending_requests[requestId];
    if (!mapp(pending))
        return;
    player = pending["player"];
    if (objectp(player))
        tell_object(player, npcName + "正在思索你的问题，请稍候……\n");
}

void retryRequest(string requestId)
{
    mapping pending;

    pending = pending_requests[requestId];
    if (!mapp(pending) || socket_fd < 0)
        return;
    socket_write(socket_fd, pending["payload"], AI_SERVER_HOST + " " + AI_SERVER_PORT);
}

void requestTimeout(string requestId)
{
    mapping pending;
    object player;

    pending = pending_requests[requestId];
    if (!mapp(pending))
        return;
    player = pending["player"];
    map_delete(pending_requests, requestId);
    if (objectp(player))
        tell_object(player, "AI暂时没有回应，请稍后重新提问。\n");
}

void read_callback(int fd, mixed message, string addr)
{
    mapping response, pending;
    string requestId, output;
    object player;

    if (fd != socket_fd || addr != AI_SERVER_HOST + " " + AI_SERVER_PORT)
        return;
    catch
    {
        response = json_decode(message);
    };
    if (!mapp(response) || !stringp(response["request_id"]))
        return;
    requestId = response["request_id"];
    pending = pending_requests[requestId];
    if (!mapp(pending) || response["player_id"] != pending["player_id"] ||
        response["npc_id"] != pending["npc_id"])
        return;
    if (response["type"] == "chat")
        output = response["response"];
    else if (response["type"] == "error")
        output = response["error"];
    if (!stringp(output))
        return;

    remove_call_out(pending["timeout"]);
    remove_call_out(pending["retry"]);
    map_delete(pending_requests, requestId);
    player = pending["player"];
    if (objectp(player))
        tell_object(player, sort_string(output + "\n", 78));
}

void remove()
{
    string requestId;
    mapping pending;
    object player;

    foreach (requestId in keys(pending_requests))
    {
        pending = pending_requests[requestId];
        remove_call_out(pending["timeout"]);
        remove_call_out(pending["retry"]);
        player = pending["player"];
        if (objectp(player))
            tell_object(player, "AI通信服务已重载，请重新提问。\n");
    }
    pending_requests = ([]);
    if (socket_fd >= 0)
        socket_close(socket_fd);
    socket_fd = -1;
}
