/*  _ping.c

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

#define VERBOSE

inherit CORE_CLEAN_UP;
inherit CORE_DBASE;

private void create()
{
    seteuid(getuid());
    set("channel_id", "網路精靈");
}

void receive_answer(mapping info)
{
    // SECURED_INTERMUD_EVENT;

    info["CONTACTED"] = ctime(time());

    if (info["NAME"] && info["PORT"] && info["PORTUDP"])
        INTERMUD_D->set_mudinfo(
            info["HOSTADDRESS"] + ":" + info["PORTUDP"], info);

#ifdef VERBOSE
    CHANNEL_D->do_channel(this_object(), "sys", "收到來自 " + info["NAME"] + " 的 PING 回應。");
#endif
}

void receive_request(mapping info)
{
    int port;
    mapping from;

    // SECURED_INTERMUD_EVENT;

    // 我們必須知道對方的 UDP port 才有辦法回答，如果對方沒給──別理它。
    if (!info["PORTUDP"])
        return;

    from = INTERMUD_D->query_mudinfo(
        info["HOSTADDRESS"] + ":" + info["PORTUDP"]);

    sscanf(info["PORTUDP"], "%d", port);
    INTERMUD_D->send_event(info["HOSTADDRESS"], port, "ping_a", ([
        "NAME"      :   MUD_NAME_INTERMUD,
        "ALIAS"     :   MUD_NAME_ABBR,
        "HOST"      :   MUD_HOSTNAME,
        "MUDLIB"    :   MUDLIB_NAME,
        "VERSION"   :   MUDLIB_VERSION,
        "ENCODING"  :   MUDLIB_LOCALE,
        "PORTUDP"   :   "" + INTERMUD_D->query_udp_port(),
    ]));

#ifdef VERBOSE
    CHANNEL_D->do_channel(this_object(), "sys",
                "收到 PING 要求，送出回應到 " + info["HOSTADDRESS"] + "(" + info["NAME"] + ")" + " UDP 埠 " + info["PORTUDP"] + "。");
#endif
}

void send_request(string dest, int port)
{
    // SECURED_INTERMUD_API;

    INTERMUD_D->send_event(dest, port, "ping_q", ([
        "NAME"      :   MUD_NAME_INTERMUD,
        "PORTUDP"   :   "" + INTERMUD_D->query_udp_port(),
    ]));

#ifdef VERBOSE
    CHANNEL_D->do_channel(this_object(), "sys",
                "送出 PING 要求到 " + dest + " UDP 埠 " + port + "。");
#endif
}
