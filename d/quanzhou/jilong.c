// Room: /d/quanzhou/jilong.c
// Date: May 7, 96   Jay
#include <ansi.h>;
inherit ROOM;

void create()
{
	set("short", "鸡笼港");
	set("long", @LONG
鸡笼为台湾北部良港。群山环抱的港口腹地广大，人
烟稠密，有“台湾诸葛亮”之称的陈永华先生在此垦田养
桑，修养生息，遗爱甚长。
LONG );
	set("exits", ([
                "south" : __DIR__"chiqian",
	]));
	set("objects", ([
		__DIR__"npc/wokou": 2,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "quanzhou");
	setup();
	replace_program(ROOM);
}

