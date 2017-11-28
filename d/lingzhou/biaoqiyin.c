// Room: /lingzhou/biaoqiyin.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "骠骑营");
	set("long", @LONG
这里是皇室禁卫军的驻地，在灵州城西北，骠骑营占地面积庞大，
北面是营房，南面是小校场，西面紧挨着城墙是一排马厩，有东营门
和南营门通向皇宫和大街。骠骑营的军士俱是西夏军中千挑万选的猛
士，平时负责皇城外围的警戒，皇上出巡时便挑起开道护卫的重责，
战时更是一支生力军。
LONG );
	set("exits", ([
		"south" : __DIR__"xiaoxiaochang",
		"north" : __DIR__"yinfang",
		"east"  : __DIR__"xidajie",
		"west"  : __DIR__"malan",
                "northwest" : __DIR__"ximen",
	]));
	set("objects", ([
		__DIR__"npc/xixiabing" :2,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

