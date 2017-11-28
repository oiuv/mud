#include <room.h>
#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "大道");
	set("long", @LONG
这里是紫禁城北边靠近城门的一条宽阔的大道，南方不远就是京城的永定
门了，厚实坚固的古城墙高高耸立着。每天都有许多人经过这条大道出入京城。
北方则经过天坛通往京城的中心。
LONG );
	set("exits", ([
		"north" : __DIR__"tiantan",
		"south" : __DIR__"yongdingmen",
	]));
	set("objects", ([
		__DIR__"npc/tiaofu" : 1,
		__DIR__"npc/kid1" : 1,
		__DIR__"npc/tangzi" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

