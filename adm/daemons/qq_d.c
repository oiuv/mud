/** QQ_D QQ群消息转发机器人
 *
 * 机器人服务端使用mirai开源框架，需要自己配置QQ API服务器
 * 服务器配置文档：https://project-mirai.github.io/mirai-api-http/
 *
 */
inherit CORE_DIR "system/daemons/http/qq_d";

#include <ansi.h>

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
        // 转发消息到其它MUD
        if (sender["group"]["id"] == Group)
            "/adm/daemons/network/services/gchannel.c"->send_msg("ic", sender["group"]["name"], sender["memberName"], msg);
    }
}

void create()
{
    if (env("MIRAI_HOST"))
    {
        // Debug = 1;
        verify();
    }
}
