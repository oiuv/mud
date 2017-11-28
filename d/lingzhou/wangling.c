// Room: /lingzhou/wangling.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "西夏王陵");
	set("long", @LONG
这里是西夏历代皇帝的陵墓。座落在灵州西北，周围四山环抱，环
境非常幽静，周围种满了苍松翠柏，其中当今西夏皇帝李元昊的父亲赵
德明的陵墓最为雄伟，概因西夏虽自唐初开国，然直至宋初赵德明才称
皇帝，所以李元昊常自比为李世民第二，而把他父亲陵墓造的异常宏大。
LONG );
	set("exits", ([
		"southup" : __DIR__"qingxinquan",
		"north"   : __DIR__"chiling",
	]));
	set("objects", ([
		__DIR__"npc/shiwushi" : 4,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

