#include <room.h>
inherit ROOM;

void create()
{
	set("short", "康府走廊");
	set("long", @LONG
这是一条木制的走廊，地面很是光滑，被打整得一尘不染。几个康府的下
人在此走动。南边是康府的大院，北边则是康府的大厅了。
LONG );
       set("exits", ([
		"north" : __DIR__"kangfu_dating",
		"south" : __DIR__"kangfu_dayuan",
	]));
	set("objects", ([
		__DIR__"npc/jiading_k" : 1,
		__DIR__"npc/shizhe" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}