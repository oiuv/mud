// Room: /d/suzhou/road2.c
// Date: May 31, 98  Java

inherit BUILD_ROOM;

void create()
{
	set("short", "青石官道");
	set("long", @LONG
你走在一条青石大道上，人来人往非常繁忙，不时地有人
骑着马匆匆而过。大道两旁有一些小货摊，似乎是一处集市。
东面就是苏州城了。虽然是城外，但是景色宜人，绝对是一个
好住处。
LONG );
	set("outdoors", "suzhou");
	set("exits", ([
		"west"  : __DIR__"road3",
		"east"  : __DIR__"ximen",
	]));

        set("max_room", 4);

	setup();
	replace_program(BUILD_ROOM);
}
