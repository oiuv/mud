#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "西门");
        set("long", @LONG
这是个山庄的西门。拱月形的竹门分外雅致，门上挂着块
竹牌，上面写着「西门外面有毒蛇出没，慎行」几个醒目的大
字。西门外面则是杂草丛生，很是荒凉。
LONG);
        set("outdoors", "baituo");
        set("exits", ([
                "west" : __DIR__"cao1",
                "east" : __DIR__"changlang",
        ]));
        set("objects", ([
                __DIR__"npc/menwei" : 1,
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (! objectp(guarder = present("men wei", this_object())))
                return 1;

        if (dir == "east")
                return guarder->permit_pass(me, dir);

	if (dir == "west"
	   && (int)me->query("combat_exp") < 600
	   && guarder)
	        return notify_fail(CYN "门卫拦住你道：你经验太低，会被"
                                   "毒蛇咬死，还是不要乱闯的好。\n" NOR);

        return 1;
}
