// Room: /lingzhou/chiling.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "赤陵");
	set("long", @LONG
这是西夏前身平夏部开国之主拓跋赤辞的陵墓，因为年代久远而看
上去有点破败，不大的石制坟头，几棵小草从石缝里伸出头来看着你，
陵前的两棵松柏倒长得非常高大。毕竟是几百年前种的呀。
LONG );
	set("exits", ([
		"south"   : __DIR__"wangling",
		"north"   : __DIR__"deling",
	]));
	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

