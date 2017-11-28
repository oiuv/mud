// /guanwai/longmen.c

inherit ROOM;

void create()
{
	set("short", "龙门峰");
	set("long", @LONG
龙门峰在乘槎河西岸，因状如门形，故名龙门。崇崖峻壁，形态奇特，
宛如卧龙吸水，传说大禹治水曾到此峰，旁有蝌蚪形石柱。
LONG );
	set("exits", ([
		"northeast" : __DIR__"damen",
		"west"      : __DIR__"luming",
		"east"      : __DIR__"tianhuo",
		"southdown" : __DIR__"tianchi1",
	]));
	set("no_clean_up", 0);
	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}
