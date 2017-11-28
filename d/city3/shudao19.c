#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "官道");
        set("long", @LONG
你走在一条官道上，西面已经可以隐约看见成都城的城门
了，东去是蜀道。
LONG);
        set("exits", ([
                "west" :  __DIR__"road2",
                "east" : __DIR__"shudao18",
        ]));
        set("objects", ([
                "/d/beijing/npc/shusheng2" : 1,
        ]));
        set("no_clean_up", 0);
        set("outdoors", "chengdu");

        setup();
	replace_program(ROOM);
}

