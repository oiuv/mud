// Room: /d/shaolin/woshi.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "卧室");
	set("long", @LONG
卧房里只有一张竹制的矮床上面铺了半破烂的篾席。席子上的
一角耷拉到地上。席腿边有一把断了的单刀。地上斑斑点点似乎是
好多天前留下的血迹。
LONG );
	set("exits", ([
		"south" : __DIR__"xiaowu",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

