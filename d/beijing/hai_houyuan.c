inherit ROOM;
#include <ansi.h>

void create()
{
	set("short","后院");
	set("long", @LONG
这里是海澄公府大厅后侧的一个小花园，杂乱地种着各种花草，看来无人
打理，杂草已经长得很高了。一些鲜花夹杂在草丛中，阵阵花香不断地飘过。
LONG );
	set("exits", ([
		"north" : __DIR__"hai_dating",
	]));

	setup();
        replace_program(ROOM);
}
