#include <room.h>
#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "西城门");
	set("long", @LONG
这里是京城的西城门，厚实坚固的古城墙高高耸立着。城门两旁整齐的站
着几个卫兵，仔细的监守着这里。每天都有许多人经过这里出入京城。出了西
城门，一条笔直的大官道向东西两边延伸。西边的官道上人来车往，尘土飞扬。
东方则是通往京城的西单北大街。
LONG );
	set("exits", ([
		"east" : __DIR__"ximenkou",
                "west" : __DIR__"ximenwai",
	]));
	set("objects", ([
		__DIR__"npc/ducha" : 1,
		__DIR__"npc/bing1" : 2,
		__DIR__"npc/tangzi" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

