// Room: /huanghe/yongdeng.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "永登");
	set("long", @LONG
这里就是西北的军事重镇永登。一座孤城耸立在茫茫荒野之上。此
城建于汉光武年间，据闻大将军霍去病曾在此练兵三年，后一举平定大
西北。历代而来，这里都有军队长驻。
LONG );
	set("exits", ([
                "southup" : "/d/changan/tulu4",
		"north"   : __DIR__"gulang",
		"east"    : __DIR__"huanghe_3",
		"west"    : __DIR__"kedian",
	]));
	set("objects", ([
		"/d/city/npc/wujiang" : 1,
		"/d/city/npc/bing" : 4,
	]));
	set("outdoors", "huanghe");
	setup();
	replace_program(ROOM);
}
