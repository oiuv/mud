// Room: /huanghe/xiayiting.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "侠义厅");
	set("long", @LONG
这是黄河帮议事的大厅，厅上挂着「侠义厅」三字匾额。厅里靠
北朝南放着一张虎皮交椅，两边摆设着几副红木桌椅，非常有气派。
墙上附庸风雅地挂了几幅丹青书法。
LONG );
	set("exits", ([
		"east"  : __DIR__"guangchang",
	]));
	set("objects", ([
		__DIR__"npc/sha" : 1,
		__DIR__"npc/peng" : 1,
		__DIR__"npc/liang" : 1,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}

