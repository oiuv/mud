#include <ansi.h>

inherit ROOM;

void create()
{
	set("short", "屠人场休息室");
	set("long", @LONG
这里黑乎乎的，地上还有一些粘满了血迹的布条，偶然
也看得到断了的长剑、钢刀什么的。北面的门紧紧锁着，里
面散发出一阵阵血腥的气味。
LONG);
	set("exits", ([
		"south" : __DIR__"entry",
	]));

        set("no_fight", 1);
	setup();
}

int valid_leave(object me, string dir)
{
        if (dir == "south")
                message_vision("$N四处张望了一下，溜出了休息室。\n", me);
        return 1;
}
