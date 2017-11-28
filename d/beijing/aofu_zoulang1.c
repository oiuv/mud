#include <room.h>
inherit ROOM;

void create()
{
	set("short", "鳌府走廊");
	set("long", @LONG
一条木制结构的走廊，地面被打整得一尘不染，很是光滑。鳌府的丫鬟和
下人穿梭至其中。南边是鳌府的大门，北边是一个大花园。
LONG );

	set("exits", ([
		"north" : __DIR__"aofu_dayuan",
		"south" : __DIR__"aofu_men",
	]));
	set("objects", ([
		__DIR__"npc/yahuan_a" : 1,
	]));
	setup();
        replace_program(ROOM);
}
