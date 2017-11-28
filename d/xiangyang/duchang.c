// Room: /d/xiangyang/duchang.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "赌场");
	set("long", @LONG
这里本是襄阳最大的赌场。可是大战当前，为免守军军心
动摇、军纪败坏，郭大侠早已下令关闭了赌场。门可罗雀的大
院，可以想象当时的规模，闲置破败的赌具，也不知道在无声
地诉说什么。
LONG );
	set("no_clean_up", 0);

	set("exits", ([
		"east" : __DIR__"southjie2",
	]));
	setup();
	replace_program(ROOM);
}
