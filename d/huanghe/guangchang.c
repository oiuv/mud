// Room: /huanghe/guangchang.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "广场");
	set("long", @LONG
广场占地甚大，部置严谨。往西过去可达黄河帮的「侠义厅」。
周围则是些房舍，供帮众居住。
LONG );
	set("exits", ([
		"east"  : __DIR__"huanghegate",
		"west"  : __DIR__"xiayiting",
	]));
	set("objects", ([
		__DIR__"npc/wu" : 1,
		__DIR__"npc/qian" : 1,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}

