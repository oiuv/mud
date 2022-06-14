/*
 * @Author: 雪风@mud.ren
 * @Date: 2022-05-15 14:28:31
 * @LastEditTime: 2022-05-16 18:12:51
 * @LastEditors: 雪风
 * @Description: 手机号码查吉凶
 *  https://bbs.mud.ren
 */
inherit CORE_HTTP;

#include <ansi.h>

nosave string Url = env("LUCK_URL") || "http://api.oiuv.cn/api/mobile/";
nosave object Receiver;

protected void response(mixed result)
{
    mixed *status = allocate(3);
    sscanf(result, "%s %d %s\r\n", status[0], status[1], status[2]);

    if (status[1] == 200)
    {
        CHANNEL_D->do_channel(Receiver, "chat", sprintf("%O", json_decode(trim(result[strsrch(result, "{")..]))));
    }
}

void query(object me, int mobile)
{
    Receiver = me;
    Http::get(Url + mobile);
}
