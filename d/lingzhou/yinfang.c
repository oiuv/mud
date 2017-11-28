// Room: /lingzhou/yinfang.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "营房");
	set("long", @LONG
这里是骠骑营的营房，一排排木屋煞是齐整, 门口空地许多军士
们围成个圈在喧闹，西夏军中崇尚勇力，佩服的是英雄，士兵个个都
是彪形大汉。
LONG );
	set("exits", ([
		"south" : __DIR__"biaoqiyin",
	]));
	set("objects", ([
		__DIR__"npc/xixiabing" :3,
	]));
//	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

