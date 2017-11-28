#include <room.h>
inherit ROOM;

void create()
{
	set("short", "天坛北门");
	set("long",  @LONG
这里是天坛的北门，站在这里已经可以清楚的望见天坛中间那座最高的建
筑——皇穹宇，相传每当皇帝祭天之后，总是到那里向着无数个神位叩头以致
谢意。从天坛北门往北则通往著名的凡陛桥。
LONG );
	set("exits", ([
		"south" : __DIR__"tiantan",
		"north" : __DIR__"tianqiao",
	]));
	set("objects", ([
		__DIR__"npc/girl2" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

