// Room: /d/xiangyang/caodi2.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;
#include <ansi.h>;

void create()
{
	set("short", "草地");
	set("long", @LONG
这是襄阳城外的草地。蒙古兵进犯以来，这里的百姓全进
城了，蒙古兵驰骋来去，以为牧场，尘土飞扬，甚是嚣张。
LONG );
        set("outdoors", "xiangyang");

	set("exits", ([
		"east"  : __DIR__"northgate2",
	]));
	set("objects", ([
		__DIR__"npc/menggubing" : 2,
	]));
	setup();
	replace_program(ROOM);
}

