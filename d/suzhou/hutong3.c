// Room: /d/suzhou/hutong3.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "胡同");
	set("long", @LONG
这是一条黑暗、肮脏的小巷，空气中仿佛飘扬着一股罪恶
的气息，几个流氓在游荡，向东南就能回到大街，你还是赶快
走吧。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"west"      : __DIR__"hutong2",
		"southeast" : __DIR__"dongdajie2",
	]));
	set("objects", ([
		"/d/city/npc/liumang" : 2,
	]));
	setup();
	replace_program(ROOM);
}

