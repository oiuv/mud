
// Room: /huanghe/yaocaidian.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "皮货药材店");
	set("long", @LONG
这是古浪城里唯一的一家店铺，一踏进铺内就可闻到一股淡淡的膻
味，隐隐可以看见堆放在后院翻晒的各式皮货，怕有不下千余件。在西
墙边，立了一个大红木药柜，里面盛放了草药。
LONG );
	set("exits", ([
		"west" : __DIR__"gulang",
	]));
	set("objects", ([
		__DIR__"npc/huoji" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

