#include <room.h>
inherit ROOM;

void create()
{
	set("short", "厢房");
	set("long", @LONG
这里是海澄公府的左侧的一个厢房，供给海澄公府的客人居住。
LONG );
	set("exits", ([
		"east" : __DIR__"hai_dayuan",
	]));

	set("sleep_room", "1");
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}
