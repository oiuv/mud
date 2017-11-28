#include <room.h>
inherit ROOM;

void create()
{
	set("short", "鳌府走廊");
	set("long", @LONG
一条木制结构的走廊，地面被打整得一尘不染，很是光滑。鳌府的丫鬟和
下人穿梭至其中。西边是鳌拜的书房，东边是鳌拜府的后院。
LONG );

	set("exits", ([
		"east" : __DIR__"aofu_houyuan",
		"west" : __DIR__"aofu_shufang",
	]));
	set("objects", ([
		__DIR__"npc/jiading_a" : 1,
		__DIR__"npc/yahuan_a" : 1,
	]));
	setup();
        replace_program(ROOM);
}
