#include <room.h>
inherit ROOM;

void create()
{
	set("short", "康府走廊");
	set("long", @LONG
这是一条木制的走廊，地面很是光滑，被打整得一尘不染。几个康府的下
人在此走动。南边是康府的大厅，左右两侧是两个厢房。北边是康亲王的书房
所在。这里站着一个秃头和尚，那是康府的侍卫头领。
LONG );
       set("exits", ([
		"north" : __DIR__"kangfu_shufang",
		"south" : __DIR__"kangfu_dating",
		"west" : __DIR__"kangfu_xifang",
		"east" : __DIR__"kangfu_dongfang",
	]));
	set("objects", ([
		__DIR__"npc/jiading_k" : 1,
		__DIR__"npc/yahuan_k" : 1,
		__DIR__"npc/shenzhao" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}