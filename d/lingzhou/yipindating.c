// Room: /lingzhou/yipindating.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "一品堂大厅");
	set("long", @LONG
这里是西夏一品堂的大厅，厅内阔大，显得有点阴晦。数十根合抱
大柱撑着看不清顶的飞檐，厅里气氛很是森森煞人。北面正中一副楠木
匾额(bian)高悬，金字蓝底，隐隐生威。
LONG );
	set("item_desc", ([
		"bian"  : "一品堂\n",
	]));
	set("exits", ([
		"south"  : __DIR__"yipindayuan",
	]));
	set("objects", ([
		__DIR__"npc/yipinwushi" :4,
	]));
	setup();
	replace_program(ROOM);
}
