#include <room.h>
inherit ROOM;

void create()
{
	set("short", "永内东街");
	set("long", @LONG
永内东街是一条繁华的大街，也是北京最杂乱的地段。一条宽阔的青石大
道从中穿过，向东西两头延伸。西边是京城里著名的凡陛桥。北面是一家豪华
的大赌场，此时正从里面传来一阵阵不堪入耳的声音。南边是汇英酒楼，在京
城中，也算是小有名气的。
LONG );
	set("exits", ([
		"south" : __DIR__"huiying",
		"north" : __DIR__"duchang",
		"east" : __DIR__"yong_2",
		"west" : __DIR__"tianqiao",
	]));
	set("objects", ([
		__DIR__"npc/dipi" : 1,
		__DIR__"npc/boy1" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

