// Room: /d/taishan/.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "斗母宫");
	set("long", @LONG
上了一段山路，游人一般都会在这里稍为休息。这里的地势已
经比泰山邻近的徂徕山为高，从这里往东北走便是石经峪。
LONG );
	set("exits", ([
		"eastup" : __DIR__"shijin",
		"southdown" : __DIR__"yitian",
	]));
	set("objects",([
		__DIR__"npc/jian-ke" : 1,
	]));
	set("outdoors", "taishan");
	setup();
	replace_program(ROOM);
}

