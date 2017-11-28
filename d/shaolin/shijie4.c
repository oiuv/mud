// Room: /d/shaolin/shijie4.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "石阶");
	set("long", @LONG
水声越来越大，山间充满了浓浓的水气。石阶上，断裂的山
隙中，都流出一道道细细的泉水，汇成一股澄碧的小溪，向山下
蜿蜒流去。周围绿意荡漾，鸟语鹦声，如置身仙境。
LONG );
	set("exits", ([
		"northup" : __DIR__"shijie5",
		"eastdown" : __DIR__"shijie3",
	]));
	set("outdoors", "shaolin");
	setup();
	replace_program(ROOM);
}

