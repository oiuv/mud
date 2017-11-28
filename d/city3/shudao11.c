#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "蜀道");
        set("long", @LONG
你走在以险著称天下的蜀道上，从这里向西越过高山，就
可以进入四川盆地了，东边是去风景优美的三峡。道路十分崎
岖，时而左转时而上山，时而又要穿过森林。
LONG);
        set("exits", ([
                "east" : __DIR__"sanxia3",
  		"west" : __DIR__"shudao12",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "chengdu");

        setup();
        replace_program(ROOM);
}

