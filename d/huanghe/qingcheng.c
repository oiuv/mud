// Room: /huanghe/qingcheng.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "青城");
	set("long", @LONG
青城位于靖远以南三百二十里，西南八十里就是兰州，名为青城，
其实只是个小镇，因为地处北去西夏的要冲，许多往来西夏和大宋的商
旅都必须经过这儿，人来人往很是热闹。
LONG );
	set("exits", ([
		"north" : __DIR__"shamo",
		"east"  : __DIR__"hetao",
	]));
	set("no_clean_up", 0);
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}

