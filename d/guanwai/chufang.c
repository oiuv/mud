// Room: /d/guanwai/chufang.c

inherit ROOM;

void create()
{
	set("short", "厨房");
	set("long", @LONG
炊烟缭绕，蒸汽腾腾，香味扑鼻而来。靠墙有一个灶台，支着一
口大锅，里面煮着香喷喷的米粥，旁边的一个火上蒸着白面馒头。一
个老仆人聚精会神的整理着厨房里面物什。
LONG );
	set("exits", ([
		"east" : __DIR__"shizilu",
	]));

	set("objects",([
		__DIR__"obj/wan" : 2,
                __DIR__"obj/mantou" : 5,
	]));

	set("resource/water", 1);
	setup();
	replace_program(ROOM);
}
