// Room: /lingzhou/beidajie.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "北大街");
	set("long", @LONG
这是灵州北大街，干净、宽敞、安静。双人合抱的杨树十步一株，
整齐的排在路的两边。西面和东面都是高高的围墙，南面通向城中心，
北面就是西夏皇宫大门了。因为是皇城和城中心的唯一连接通道，便不
容许在两边开店，显得特别清静。
LONG );
	set("exits", ([
		"south" : __DIR__"center",
		"north" : __DIR__"gonggate",
	]));
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

