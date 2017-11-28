// Room: /d/shaolin/zoulang7.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "走廊");
	set("long", @LONG
这里是禅房走廊。走廊南侧的房顶倚着南面的高墙，另一侧
则与北边和尚院的屋顶相连。南面墙上挂了一付对联：“灵根孕
育源流出，心性修持大道生”。往北通向和尚院。
LONG );
	set("exits", ([
		"east" : __DIR__"zoulang8",
		"west" : __DIR__"fzlou",
		"north" : __DIR__"hsyuan1",
		"south" : __DIR__"wuchang2",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

