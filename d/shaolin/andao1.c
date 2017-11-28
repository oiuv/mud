#include <room.h>
inherit ROOM;

void create()
{
	set("short", "暗道");
	set("long", @LONG
这里是一个阴暗潮湿的地道，四壁用粗糙的片岩垒垛而成，
只见一颗颗水珠沿着墙壁滚下来，溅在地上。也许是因为长时
间无人通行的缘故，整个地道弥漫着一股腐尸般的恶臭。
LONG);
	set("exits", ([
		"south" : __DIR__"rukou",
		"north" : __DIR__"jianyu1",
	]));
	create_door("north","木门","south",DOOR_CLOSED);
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

