// Room: /lingzhou/gongsquare.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "皇宫广场");
	set("long", @LONG
这里是皇宫广场。
LONG );
	set("exits", ([
		"south"  : __DIR__"gonggate",
	]));
	set("objects", ([
		__DIR__"npc/gongweishi" :2,
	]));
	setup();
	create_door("south" , "红漆宫门", "north" , DOOR_CLOSED);
	//replace_program(ROOM);
}

