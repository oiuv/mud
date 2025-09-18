/*
 * @Author: 雪风@mud.ren
 * @Date: 2022-05-15 00:50:12
 * @LastEditTime: 2022-05-16 20:04:25
 * @LastEditors: 雪风
 * @Description: 智能问答机器人(https://www.jisuapi.com/api/iqa/)
 *  https://bbs.mud.ren
 */
inherit CORE_HTTP;

#include <ansi.h>

nosave string Url = "http://api.jisuapi.com/iqa/query";
nosave string AppCode = env("AppKey");

nosave object Receiver;

protected void response(mixed result)
{
    string res;
    Debug && debug_message(result);
    res = trim(result[strsrch(result, "content") + 10..strsrch(result, "relquestion") - 4]);
    // 清理转义字符
    res = replace_string(res, "\\r", "\r");
    res = replace_string(res, "\\n", "\n");
    res = replace_string(res, "\\t", "\t");
    res = replace_string(res, "\\/s", "");
    res = replace_string(res, "\\", "");
    // 替换默认回复
    res = replace_string(res, "defaultReply", "...");
    if (sizeof(res) < 3)
    {
        return;
    }
    CHANNEL_D->do_channel(Receiver, "chat", res);
}

// 智能问答
void iqa(object me, string arg)
{
    Receiver = me;

    if (!AppCode)
    {
        error("请先配置AppKey！");
    }

    Http::get(Url, (["appkey":AppCode, "question":arg]), (["Content-Type":"application/json;charset=UTF-8"]));
}
