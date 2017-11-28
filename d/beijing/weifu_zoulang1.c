#include <room.h>
inherit ROOM;

void create()
{
	set("short", "韦府走廊");
	set("long", @LONG
这是一条木制的走廊，地面很是光滑，被打整得一尘不染。几个韦府的下
人在此走动。北边是个巨大的花园。
LONG );
       set("exits", ([
		"north" : __DIR__"weifu_dayuan",
		"east" : __DIR__"weifu_men",
	]));
	set("objects", ([
		__DIR__"npc/shizhe" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}