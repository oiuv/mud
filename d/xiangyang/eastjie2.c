// Room: /d/xiangyang/eastjie2.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "东大街");
	set("long", @LONG
这儿是很大的十字街口，北边是东内大街，南面是一条街
道，听说有钱人一般都住在里面，东面通向襄阳城的青龙门，
向西可到达中央广场。
LONG );
        set("outdoors", "xiangyang");
	set("no_clean_up", 0);

	set("exits", ([
		"east"  : __DIR__"eastjie3",
		"west"  : __DIR__"eastjie1",
		"south" : __DIR__"jiedao",
		"north" : __DIR__"eastroad1",
	]));
	setup();
	replace_program(ROOM);
}

