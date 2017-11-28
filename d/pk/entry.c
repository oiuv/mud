#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "屠人场入口");
	set("long", @LONG
这里是一间不算大的小屋，当中摆了一个桌子，后面做
着一个人，正笑吟吟的看着你。他身后有一扇门虚掩着，里
面黑乎乎的，也不知道通往哪里。西面望出去是宽阔敞亮的
大街，让人无限向往。
LONG);
	set("exits", ([
		"north" : __DIR__"ready",
                "west"  : "/d/changan/yongtai-dadao2",
	]));

        set("objects", ([
                __DIR__"npc/wu" : 1,
        ]));

        set("no_fight", 1);
	setup();
}

int valid_leave(object me, string dir)
{
        if (dir == "north")
                return notify_fail(CYN "乌老大喝道：给我站住！那儿不能随意进入。\n" NOR);

        return ::valid_leave(me, dir);
}
