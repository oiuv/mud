// Room: /t/wanjiegu/bridge.c

#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "铁索桥");
        set("long", @LONG
一座横跨澜沧江的铁索桥，此桥共有四道铁索，两条在下，上
铺木板，以供行走，两条在旁，作为扶手。一踏上桥，几条铁索便
即晃动。江水荡荡，如快马奔腾从脚底飞过，只要一个失足，卷入
江水，任你多好的水性也难活命。
LONG
        );
        set("outdoors", "wanjiegu");
        set("exits", ([ /* sizeof() == 2 */
            "west" : __DIR__"port2",
            "east" : __DIR__"port",
        ]));

        setup();
}

