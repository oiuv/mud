// AI客户端守护程序
// 提供全局唯一的AI服务通信接口

#include <socket.h>

inherit F_DBASE;

#define AI_SERVER_HOST "127.0.0.1"
#define AI_SERVER_PORT 9999

private void handle_chat_response(mapping response);
private void handle_config_response(mapping response);
private void handle_memory_response(mapping response);

nosave private int socket_fd;
nosave private mapping pending_requests = ([]);

void create() {
    seteuid(getuid(this_object()));

    // 创建UDP socket
    socket_fd = socket_create(DATAGRAM, "read_callback");
    if (socket_fd < 0) {
        debug_message("AI客户端守护程序: 无法创建socket - " + socket_error(socket_fd));
        return;
    }

    // 绑定到任意端口
    if (socket_bind(socket_fd, 0) < 0) {
        debug_message("AI客户端守护程序: 无法绑定socket");
        socket_close(socket_fd);
        socket_fd = -1;
        return;
    }

    // debug_message("[AI]客户端守护程序已启动");
}

// 发送对话请求
varargs string send_chat_request(string npc_id, string player_id, string player_name,
                               string message, mapping context) {
    mapping request = ([
        "type": "chat",
        "npc_id": npc_id,
        "player_id": player_id,
        "player_name": player_name,
        "message": message,
        "context": context || ([])
    ]);
    string json_str = json_encode(request);
    int result;

    if (socket_fd < 0) {
        debug_message("AI客户端守护程序: socket未初始化");
        return "AI服务未启动";
    }
    // debug(json_str);
    result = socket_write(socket_fd, json_str, AI_SERVER_HOST + " " + AI_SERVER_PORT);

    if (result < 0) {
        debug_message("AI客户端守护程序: 发送失败 - " + socket_error(result));
        return "AI服务通信异常";
    }

    return "处理中...";
}

// 数据接收回调
void read_callback(int fd, mixed message, string addr) {
    mapping response;

    catch {
        response = json_decode(message);
    };

    if (!response || !mapp(response)) {
        debug_message("AI客户端守护程序: 空或无效响应");
        return;
    }

    // 处理响应
    switch (response["type"]) {
        case "chat":
            handle_chat_response(response);
            break;
        case "config":
            handle_config_response(response);
            break;
        case "memory":
            handle_memory_response(response);
            break;
    }
}

// 处理聊天响应
private void handle_chat_response(mapping response) {
    string npc_id = response["npc_id"];
    string player_id = response["player_id"];
    string ai_response = response["response"];
    object npc, player;

    // debug(response);
    if (!npc_id || !player_id || !ai_response)
        return;

    npc = find_living(npc_id);
    player = find_player(player_id);

    if (npc && player) {
        tell_object(player, npc->name() + "说道：" + ai_response + "\n");
    }
}

// 处理配置响应
private void handle_config_response(mapping response) {
    string npc_name = response["npc_id"];
    mapping config = response["config"];

    if (npc_name && mapp(config)) {
        // 缓存配置信息
        set_temp("npc_config_" + npc_name, config);
    }
}

// 处理记忆响应
private void handle_memory_response(mapping response) {
    string npc_name = response["npc_id"];
    string player_id = response["player_id"];
    mapping memory = response["memory"];

    if (npc_name && player_id && mapp(memory)) {
        debug_message(sprintf("AI客户端守护程序: %s 对 %s 的记忆已更新", npc_name, player_id));
    }
}

// 清理资源
void remove() {
    if (socket_fd >= 0) {
        socket_close(socket_fd);
        socket_fd = -1;
    }
}
