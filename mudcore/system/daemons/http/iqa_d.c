/*
 * @Author: 雪风@mud.ren
 * @Date: 2022-05-15 00:50:12
 * @LastEditTime: 2022-05-16 20:04:25
 * @LastEditors: 雪风
 * @Description: 智能应答机器人(https://apis.baidu.com/store/detail/eef864e1-6f2e-4631-befc-5afe35cab769)
 *  https://bbs.mud.ren
 */
inherit CORE_HTTP;

#include <ansi.h>

nosave string Url = env("IQA_URL") || "http://jisuapiareacode.api.bdymkt.com/iqa/query?question=";
nosave string AppCode = env("AppCode");

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
        error("请先配置AppCode！");
    }

    Http::post(Url + arg, 0, (["Content-Type":"application/json;charset=UTF-8", "X-Bce-Signature":"AppCode/" + AppCode]));
}
