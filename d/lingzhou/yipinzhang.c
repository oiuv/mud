// Room: /lingzhou/yipinzhang.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "一品堂帐房");
	set("long", @LONG
这里是西夏一品堂的帐房，一品堂中的武士做下大案以后往往就是
来这里领取他们的酬劳的。一个老先生两眼一抹黑在此管帐。
LONG );
	set("exits", ([
		"east"  : __DIR__"yipindayuan",
	]));
	set("objects", ([
		__DIR__"npc/zhangfang" :1,
	]));
	setup();
	replace_program(ROOM);
}
