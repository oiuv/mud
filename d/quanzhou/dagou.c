// Room: /d/quanzhou/dagou.c
// Date: May 7, 96   Jay
#include <ansi.h>;
inherit ROOM;

void create()
{
	set("short", "打狗港");
	set("long", @LONG
打狗港位于台湾南部，港域口小腹大，外有岛链环抱，
内具曲折峡湾，诚全台第一良港。
LONG );
	set("exits", ([
                "north" : __DIR__"chiqian",
	]));
	set("objects", ([
		__DIR__"npc/wokou": 4,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "quanzhou");
	setup();
	replace_program(ROOM);
}

