/*  _gchannel.c

    Copyright (C) 1994-2000 Annihilator <annihilator@muds.net>

    This program is a part of ES2 mudlib. Permission is granted to use,
    modify, copy or distribute this program provided this copyright notice
    remains intact and subject to the restriction that this program MAY
    NOT be used in any way for monetary gain.

    Details of terms and conditions is available in the Copyright.ES2 file.
    If you don't receive this file along with this program, write to the
    primary author of ES2 mudlib: Annihilator <annihilator@muds.net>
*/

#include "mudlib.h"
#include "intermud.h"

inherit CORE_CLEAN_UP;

nosave string id;
nosave mapping spam_check = ([]);

private void create() { seteuid(getuid()); }

string query(string prop) { return prop == "channel_id" ? id : 0; }

void receive(mapping info)
{
    mapping m;
    // int port;
    string mid, encoding, msg;

    // SECURED_INTERMUD_EVENT;

    // 檢查必須的欄位是否都有 ...
    if (undefinedp(info["NAME"]) || undefinedp(info["PORTUDP"]) || undefinedp(info["USRNAME"]) || undefinedp(info["CHANNEL"]) || undefinedp(msg = info["MSG"]))
        return;

    // 如果我們沒有取得和這個 MUD 的聯繫，送出一個 PING 要求。
    mid = info["HOSTADDRESS"] + ":" + info["PORTUDP"];
    if (!mapp(m = INTERMUD_D->query_mudinfo(mid)))
        INTERMUD_SERVICE("ping")->send_request(info["HOSTADDRESS"], info["PORTUDP"]);

#ifdef ENABLE_ANTISPAM
    if (spam_check[mid] == msg)
        return;
    spam_check[mid] = msg;
#endif

    id = info["USRNAME"] + "@" + info["NAME"];

    // 若有 CNAME，使用擴充格式。
    if (info["CNAME"])
        id = info["CNAME"] + "(" + id + ")";

    // 檢查是否指定使用語言的編碼方式。
    encoding = info["ENCODING"];
    if (!encoding && mapp(m))
        encoding = m["ENCODING"];

    // 需要的話進行轉碼。
    if (encoding && encoding != MUDLIB_LOCALE)
    {
        if (encoding == "GB" && MUDLIB_LOCALE == "BIG5")
        {
            // todo
        }
        else if (encoding == "BIG5" && MUDLIB_LOCALE == "GB")
        {
            //todo
        }
    }

    // 執行頻道訊息。
    CHANNEL_D->do_channel(this_object(), info["CHANNEL"], msg, info["EMOTE"]);
}

void send(string ch, string id, string name, string msg, int emote, function flt)
{
    string mid;
    mapping info, mud;

    // SECURED_INTERMUD_API;

    info = ([
        "NAME"      :   MUD_NAME_INTERMUD,
        "PORTUDP"   :   "" + INTERMUD_D->query_udp_port(),
        "USRNAME"   :   id,
        "CNAME"     :   name,
        "CHANNEL"   :   ch,
        "ENCODING"  :   MUDLIB_LOCALE,
        "MSG"       :   msg,
    ]);

    if (emote)
        info["EMOTE"] = "YES";

    foreach (mid, mud in INTERMUD_D->query_mudlist())
    {
        if (!evaluate(flt, mud))
            continue;
        INTERMUD_D->send_event(mud["HOSTADDRESS"], mud["PORTUDP"], "gchannel", info);
    }
}
