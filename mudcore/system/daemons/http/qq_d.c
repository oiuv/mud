/*
 * @Author: 雪风@mud.ren
 * @Date: 2022-05-14 20:26:39
 * @LastEditTime: 2022-05-16 20:30:32
 * @LastEditors: 雪风
 * @Description: QQ_D QQ群消息转发机器人，机器人服务端使用Mirai开源框架，需要自己配置QQ API服务器
 *  服务器配置文档：https://bbs.mud.ren/threads/163
 */
inherit CORE_HTTP;

#include <ansi.h>

#define STATE_VERIFYING 0
#define STATE_BINDING 1
#define STATE_CONNECTING 2
#define STATE_CONNECTED 3

// QQ消息API服务器配置
nosave string Base_uri = env("MIRAI_HOST") || "http://mud.ren:8006";
nosave string Mirai_verifyKey = env("MIRAI_KEY") || "QQ7300637-6427";
nosave int Mirai_qq = env("MIRAI_QQ") || 21791131;
// 游戏消息转发到指定的QQ群
nosave int Group = env("MIRAI_GROUP") || 9783836;

nosave string Session;
nosave int ReadyState;

protected void bind();
protected void websocket();
protected void msg(mixed data);

protected void response(mixed result)
{
    int n = strsrch(result, "{");
    Debug && debug_message(result);

    if (n > 0)
    {
        mixed json;
        json = json_decode(trim(result[n..]));
        Debug && debug_message(sprintf("%O", json));
        switch (ReadyState)
        {
        case STATE_VERIFYING:
            if (json["session"])
            {
                debug_message("QQ_D 认证完成！");
                Session = json["session"];
                debug_message("QQ_D 开始绑定！");
                bind();
            }
            break;
        case STATE_BINDING:
            if (!json["code"])
            {
                debug_message("QQ_D 绑定完成！");
                debug_message("QQ_D 连接ＷＳ！");
                websocket();
            }
            break;
        case STATE_CONNECTING:
            ReadyState = STATE_CONNECTED;
            debug_message("QQ_D 连接成功！");
            break;
        case STATE_CONNECTED:
            msg(json["data"]);
        default:
            break;
        }
    }
}

// 可重写此方法以适应自己的MUD
protected void msg(mapping data)
{
    mapping sender, messageChain;
    string type;
    if (!data)
    {
        return;
    }

    sender = data["sender"];
    type = data["type"];
    // 这里只做最傻瓜的处理
    messageChain = data["messageChain"][1];
    if (type == "GroupMessage")
    {
        string msg = "[其它类型消息]";
        if (messageChain["type"] == "Plain")
        {
            msg = messageChain["text"];
        }
        else if (messageChain["type"] == "Face")
        {
            msg = "[表情]" + messageChain["name"];
        }
        // 发送消息到MUD
        message("info", HIG "【QQ群】" NOR + sender["memberName"] + "@" + sender["group"]["name"] + "：" + msg, users());
    }
}

/* 游戏消息转发QQ群调用此方法 */
varargs void send(string msg, int qun)
{
    string body;
    string qq_qun = Group + "";
    if (qun)
    {
        qq_qun = qun + "";
    }
    // body = "{\"sessionKey\":\"" + Session + "\",\"target\":" + qq_qun + ",\"messageChain\":[{\"type\":\"Plain\",\"text\":\"" + msg + "\"}]}";
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
        "session":Session,
        "group":qq_qun,
        "msg":msg,
    ]));

    Http::post(Base_uri + "/sendGroupMessage", body);
}

// 连接websocket
protected void websocket()
{
    ReadyState = STATE_CONNECTING;
    Http::ws(Base_uri + "/all?verifyKey=" + Mirai_verifyKey + "&sessionKey=" + Session);
}
// 绑定session到QQ
protected void bind()
{
    ReadyState = STATE_BINDING;
    Http::post(Base_uri + "/bind", (["sessionKey":Session, "qq":Mirai_qq]), (["Content-Type":"application/json"]));
}

// 认证获取session
protected void verify()
{
    ReadyState = STATE_VERIFYING;
    Http::post(Base_uri + "/verify", (["verifyKey":Mirai_verifyKey]), (["Content-Type":"application/json"]));
}

void create()
{
    Http::create();
    seteuid(ROOT_UID);
    // Debug = 1;
    // 初始化认证，请继承调用
    // verify();
}
