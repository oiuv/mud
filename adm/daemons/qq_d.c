/** QQ_D QQ群消息转发机器人
 *
 * 机器人服务端使用mirai开源框架，需要自己配置QQ API服务器
 * 服务器配置文档：https://github.com/project-mirai/mirai-api-http
 * mirai-api-http 版本：v2.1.0
 *
 */
#include <ansi.h>

#define STREAM 1
#define EESUCCESS 1
// QQ消息API服务器配置
nosave string host = "mud.ren";
nosave string addr = "118.190.104.241 8006";
nosave string mirai_verifyKey = "QQ7300637-6427";
nosave int mirai_qq = 21791131;
// 游戏消息转发到指定的QQ群
nosave int group = 9783836;
nosave mapping status = ([]);
nosave string session;

protected void bind();
protected void websocket();
protected void msg(mixed data);
protected void send(string msg);

protected void http(int fd)
{
    socket_write(fd, status[fd]["http"]);
}

protected void receive_verify(int fd, mixed result)
{
    int n = strsrch(result, "{");
    // debug_message(result);
    if (n > 0)
    {
        mixed json;
        json = json_decode(trim(result[n..]));
        // debug_message(sprintf("%O", json));
        session = json["session"];
    }

    if (stringp(session))
    {
        socket_close(fd);
        debug_message("QQ_D 开始认证！");
        bind();
    }
}

protected void receive_bind(int fd, mixed result)
{
    int n = strsrch(result, "{");
    // debug_message(result);
    if (n > 0)
    {
        mixed json;
        json = json_decode(trim(result[n..]));
        // debug_message(sprintf("%O", json));
        if (!json["code"])
        {
            socket_close(fd);
            debug_message("QQ_D 认证完成！");
            websocket();
        }
    }
}
protected void receive_msg(int fd, mixed result)
{
    // debug_message(sprintf("QQ_D receive_msg(fd = %d, result = %O)", fd, result));
    socket_close(fd);
}

// 可重写此方法以适应自己的MUD
protected void msg(mapping data)
{
    mapping sender, messageChain;
    string type;

    sender = data["sender"];
    type = data["type"];
    // 这里只做最傻瓜的处理
    if (type == "GroupMessage")
    {
        string msg = "";
        foreach(messageChain in data["messageChain"])
        {
            if (messageChain["type"] == "Source")
            {
                continue;
            }
            else if (messageChain["type"] == "Plain")
            {
                msg += messageChain["text"];
            }
            else if (messageChain["type"] == "Face")
            {
                msg += "[" + messageChain["name"] + "]";
            }
            else
            {
                msg += "[" + messageChain["type"] + " 类型消息]";
            }
        }
        // 发送消息到MUD
        message("QQ", HIG "【QQ群】" HIC + sender["memberName"] + "@" + sender["group"]["name"] + "：" + msg + NOR "\n", users());
    }
}

protected void receive_data(int fd, mixed result)
{
    int n = strsrch(result, "{");
    // debug_message(result);
    if (n == 4 && strsrch(result, "}}}") > 0)
    {
        string res;
        mixed json;
        res = trim(result[n..]);
        json = json_decode(res);
        // debug_message(sprintf("%O", json));
        msg(json["data"]);
    }
}

protected void receive_callback(int fd, mixed result)
{
    // debug_message(sprintf("QQ_D receive_callback(fd = %d, result = %O)", fd, result));
}

protected void socket_shutdown(int fd)
{
    // debug_message(sprintf("QQ_D socket_shutdown(fd = %d)", fd));
    socket_close(fd);
}

/* 游戏消息转发QQ群调用此方法 */
varargs void send(string msg, int qun)
{
    int fd;
    int ret;
    string body;
    string path = "/sendGroupMessage";
    string qq_qun = group + "";
    if (qun)
    {
        qq_qun = qun + "";
    }
    // body = "{\"sessionKey\":\"" + session + "\",\"target\":" + qq_qun + ",\"messageChain\":[{\"type\":\"Plain\",\"text\":\"" + msg + "\"}]}";
    // 美化格式，不用转义
    body = @RAW
{
    "sessionKey": "%^session%^",
    "target": %^group%^,
    "messageChain": [
        {
            "type": "Plain",
            "text": "%^msg%^"
        }
    ]
}
RAW;
    body = terminal_colour(body, ([
        "session":session,
        "group":qq_qun,
        "msg":msg,
    ]));

    fd = socket_create(STREAM, "receive_callback", "socket_shutdown");
    status[fd] = ([]);
    status[fd]["http"] = "POST " + path + " HTTP/1.1\nHost: " + host + "\nContent-Type: application/json\nContent-Length: " + sizeof(string_encode(body, "utf-8")) + "\r\n\r\n" + body;
    // debug_message(status[fd]["http"]);
    ret = socket_connect(fd, addr, "receive_msg", "http");
    if (ret != EESUCCESS)
    {
        debug_message("消息服务器连接失败。\n");
        socket_close(fd);
    }
}

// 连接websocket
protected void websocket()
{
    int fd;
    int ret;
    string path = "/all?verifyKey=" + mirai_verifyKey + "&sessionKey=" + session;

    fd = socket_create(STREAM, "receive_callback", "socket_shutdown");
    status[fd] = ([]);
    status[fd]["http"] = "GET " + path + " HTTP/1.1\nHost: " + host + "\nUpgrade: websocket\nConnection: Upgrade\r\n\r\n";

    ret = socket_connect(fd, addr, "receive_data", "http");
    if (ret != EESUCCESS)
    {
        debug_message("WebSocket服务器连接失败。\n");
        socket_close(fd);
    }
}
// 绑定session到QQ
protected void bind()
{
    int fd;
    int ret;
    string path = "/bind";
    string body = "{\"sessionKey\":\"" + session + "\",\"qq\":\"" + mirai_qq + "\"}";

    fd = socket_create(STREAM, "receive_callback", "socket_shutdown");
    status[fd] = ([]);
    status[fd]["http"] = "POST " + path + " HTTP/1.1\nHost: " + host + "\nContent-Type: application/json\nContent-Length: " + strlen(body) + "\r\n\r\n" + body;
    // debug_message(status[fd]["http"]);
    ret = socket_connect(fd, addr, "receive_bind", "http");
    if (ret != EESUCCESS)
    {
        debug_message("激活服务器连接失败。\n");
        socket_close(fd);
    }
}
// 认证获取session
protected void verify()
{
    int fd;
    int ret;
    string path = "/verify";
    string body = "{\"verifyKey\":\"" + mirai_verifyKey + "\"}";

    fd = socket_create(STREAM, "receive_callback", "socket_shutdown");
    status[fd] = ([]);
    status[fd]["http"] = "POST " + path + " HTTP/1.1\nHost: " + host + "\nContent-Type: application/json\nContent-Length: " + strlen(body) + "\r\n\r\n" + body;
    // debug_message(status[fd]["http"]);
    ret = socket_connect(fd, addr, "receive_verify", "http");
    if (ret != EESUCCESS)
    {
        debug_message("认证服务器连接失败。\n");
        socket_close(fd);
    }
}

protected void create()
{
    seteuid(ROOT_UID);
    // 初始化认证
    verify();
}
