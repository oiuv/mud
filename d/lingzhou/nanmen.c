// Room: /lingzhou/nanmen.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "灵州南门");
	set("long", @LONG
这是南城门，城门正上方刻得有几个西夏文字。城墙上贴着几张官
府告示。一条大路往南通向黄羊滩。
LONG );
	set("exits", ([
		"south" : __DIR__"huangyangtan",
		"north" : __DIR__"nandajie",
	]));
	set("objects", ([
		__DIR__"npc/xiaowei" : 1,
		__DIR__"npc/xixiabing" : 2,
                "/clone/npc/walker" : 1,
	]));
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

