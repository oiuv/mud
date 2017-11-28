// Room: /lingzhou/xiaoxiaochang.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "小校场");
	set("long", @LONG
这里是骠骑营的小校场，平时军士们就在这里操练，地上很平整，
居中是指挥台，有根长达数丈的旗杆，杆顶一面绣着一条红龙的骠骑
营白色军旗迎风猎猎作响。平时军士们一天三练，早上出操，中午出
城练马术和野战，晚上则负责皇城外的巡逻。
LONG );
	set("exits", ([
		"north" : __DIR__"biaoqiyin",
	]));
	set("objects", ([
		__DIR__"npc/xixiabing" :3,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

