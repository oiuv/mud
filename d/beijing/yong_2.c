#include <room.h>
inherit ROOM;

void create()
{
	set("short", "永内东街");
	set("long", @LONG
永内东街是一条繁华的大街，也是北京最杂乱的地段。一条宽阔的青石大
道从中穿过，向东西两头延伸。西边是京城里著名的凡陛桥。从北边飘来一阵
阵诱人的花香，顿时你的精神为之一振。南边是一个打铁铺, 不时传来叮叮咚
咚的敲打声。
LONG );
	set("exits", ([
		"south" : __DIR__"tiepu",
		"north" : __DIR__"huadian",
		"east" : __DIR__"yong_3",
		"west" : __DIR__"yong_1",
	]));

	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

