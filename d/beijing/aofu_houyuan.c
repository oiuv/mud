inherit ROOM;
#include <ansi.h>

void create()
{
	set("short","鳌府后院");
	set("long", @LONG
这里是鳌府的后院，中心是一个大花园。西边一条长廊走道直通往鳌拜的
书房。南边是鳌拜私设的牢房,牢门由几个鳌府的侍卫把守着。
LONG );
	set("exits", ([
		"north" :  __DIR__"aofu_naofang",
		"west" :  __DIR__"aofu_zoulang3",
		"south" :  __DIR__"aofu_zoulang2",
	]));
	set("objects", ([
		__DIR__"npc/shi_a" : 2,
	]));
	setup();
}

int valid_leave(object me, string dir)
{
	if (objectp(present("shi wei", environment(me))) && dir == "north")
		return notify_fail("鳌府侍卫拦住你道：没有王爷的吩咐，谁也不能进去。\n\n");
	return ::valid_leave(me, dir);
}
