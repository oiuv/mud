// suti1.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "苏堤");
        set("long", @LONG
苏堤是诗人苏东坡在主持浚深西湖时用湖泥和草筑成的。苏东坡
曾有诗记述此事；“我在钱塘拓湖渌，大堤士女争昌丰。六桥横绝天
汉上，北山始与南屏通。忽惊二十五万丈，老葑席卷苍烟空。”往北
便是大道，南边是跨虹桥。跨虹桥乃苏堤六桥由北至南的第一座。桥
一边是岳湖，桥的另一边是西湖。
LONG);
        set("exits", ([
            "north"     : __DIR__"road6",
            "south"     : __DIR__"suti2",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
