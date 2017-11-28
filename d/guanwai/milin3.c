// /guanwai/milin3.c

inherit ROOM;

void create()
{
	set("short", "密林");
	set("long", @LONG
这是一片茂密的松林，杂乱的生长在倾斜的山坡上。每棵松树都有三四
抱粗细，高达十几丈。树冠枝多叶密，将天空完全遮住，因此林内显得有些
昏暗。树木之间长着很多灌木杂草，使行走很艰难，据说人参就生长在这些
杂草之中。
LONG );
	set("exits", ([
		"northdown"  : __DIR__"milin2",
		"eastup"     : __DIR__"heifengkou",
	]));
	set("no_clean_up", 0);
	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}
