// Room: /d/xiangyang/caodi4.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;
#include <ansi.h>;

void create()
{
	set("short", "草地");
	set("long", @LONG
这是襄阳城外的草地。蒙古兵进犯以来，这里的百姓全进
城了，这里几十里都没了人烟。
LONG );
        set("outdoors", "xiangyang");

	set("exits", ([
		"west"  : __DIR__"southgate2",
	]));

        set("objects", ([
                CLASS_D("hu") + "/cheng" : 1,
        ]));

	setup();
	replace_program(ROOM);
}

