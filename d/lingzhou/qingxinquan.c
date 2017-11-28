// Room: /lingzhou/qingxinquan.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "清新泉");
	set("long", @LONG
这是山中的一口清泉，位于林场北面的山坡上，周围是翠绿的松树，
潺潺的山泉水从泉眼缓缓的涌出，聚成一个小潭，小潭水又溢出流向山
下，旁边一条小路通向山下。
LONG );
	set("exits", ([
		"southeast" : __DIR__"kongdi",
		"northdown" : __DIR__"wangling",
	]));
	set("resource/water", 1);
	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

