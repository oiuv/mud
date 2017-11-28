// Room: /huanghe/hetao.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "河套");
	set("long", @LONG
常言到“黄河九害，富了一套”。河套地区灌溉系统发达，土地肥
沃，是种庄稼的好地方。
LONG );
	set("exits", ([
		"southwest" : __DIR__"huangtu",
		"east"      : __DIR__"huanghe_1",
		"west"      : __DIR__"qingcheng",
	]));
	set("no_clean_up", 0);
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}

