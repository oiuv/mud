// Room: /lingzhou/dalu1.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "林中大路");
	set("long", @LONG
这是山间的土路，勉强可以通行一辆大车，路面上有两条深深的车
辙印，路边山坡上全是参天巨木，看上去密不透风，这里很幽静，除了
偶尔几声鸟叫才能打破寂静。土路向北蜿蜒延伸转了个弯。
LONG );
	set("exits", ([
		"south"     : __DIR__"luorilin1",
		"north"     : __DIR__"xiaolu1",
		"northeast" : __DIR__"luorilin2",
	]));
	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

