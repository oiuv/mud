// Room: /d/mingjiao/huangtulu1.c
// Date: Java 97/04/9

inherit ROOM;

void create()
{
	set("short", "黄土小路");
	set("long", @LONG
这里是茂密松林中的一条黄土小路。松林极密，四面都是蓝幽幽
的感觉，映衬着天心雪峰，极尽凄美。
LONG );
	set("exits", ([
		"west" : __DIR__"huangtulu2",
		"east" : __DIR__"shanlu2",
	]));
	set("no_clean_up", 0);
	set("outdoors", "mingjiao");
	setup();
	replace_program(ROOM);
}

