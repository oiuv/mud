inherit ROOM;

void create()
{
	set("short", "药铺");
	set("long", @LONG
这是一家药铺，一股浓浓的药味让你几欲窒息，那是从药
柜上的几百个小抽屉里散发出来的。一名小伙计站在柜台后招
呼着顾客。柜台上贴着一张发黄的广告。
LONG);
	set("objects", ([
		__DIR__"npc/huoji" : 1,
	]));
	set("exits", ([
		"south" : __DIR__"dongdajie2",
	]));
	setup();
	replace_program(ROOM);
}
