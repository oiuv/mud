// Room: /d/xiangyang/xiaorong2.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "胡同");
	set("long", @LONG
这里是襄阳城内老百姓的居住区。只见小弄两边是有些小
店面，有米行、小杂货铺等。一些居民从这里进进出出。
LONG );
        set("outdoors", "xiangyang");

	set("exits", ([
		"south" : __DIR__"jiekou2",
	]));
	set("objects", ([
		__DIR__"npc/boy"  : 1,
		__DIR__"npc/girl" : 1,
	]));
	setup();
	replace_program(ROOM);
}

