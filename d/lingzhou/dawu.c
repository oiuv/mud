// Room: /lingzhou/dawu.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "林中大屋");
	set("long", @LONG
这是一幢原木制成的三层高大建筑，看上去已有些年月但仍坚固异
常，底层是由数根巨木架空，一座木梯通向二楼，三楼的楼顶上挂着一
面绣着一条青龙的大旗，看上去已破旧不堪。人们只知道主人姓李。
LONG );
	set("exits", ([
		"out"     : __DIR__"kongdi",
	]));
	set("objects", ([
		__DIR__"npc/ye" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

