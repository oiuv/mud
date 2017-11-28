#include <room.h>
inherit ROOM;

void create()
{
	set("short", "树林");
	set("long", @LONG
你走在树林中，只听见群鸟争鸣，四周景致宜人，想不到
襄阳城外竟有如此风景。
LONG );
       set("exits", ([
		"northeast" : __DIR__"shanlu1",
		"south" : __DIR__"xiaodao1",
	]));
	set("outdoors", "xiangyang");
	setup();
	replace_program(ROOM);
}