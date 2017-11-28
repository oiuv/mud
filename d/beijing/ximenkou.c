#include <room.h>
#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "城门口");
	set("long", @LONG
这里是京城西城城边靠近城门的一条宽阔的大道，西方就是京城的西城门
了，厚实坚固的古城墙高高耸立着。每天都有许多人经过这条大道出入京城。
东方是京城的西单北大街。
LONG );
	set("exits", ([
		"west" : __DIR__"xichengmen",
		"east" : __DIR__"bei_1",
	]));
	set("objects", ([
		__DIR__"npc/tiaofu" : 1,
		__DIR__"npc/old2" : 1,
		__DIR__"npc/tangzi" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

