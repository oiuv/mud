#include <room.h>
inherit ROOM;

void create()
{
	set("short", "鳌府走廊");
	set("long", @LONG
一条木制结构的走廊，地面被打整得一尘不染，很是光滑。鳌府的丫鬟和
下人穿梭至其中。南边是鳌府的大厅，北边则通往鳌府的后院。
LONG );

	set("exits", ([
		"north" : __DIR__"aofu_houyuan",
		"south" : __DIR__"aofu_dating",
	]));
	set("objects", ([
		__DIR__"npc/jiading_a" : 1,
	]));
	setup();
        replace_program(ROOM);
}
