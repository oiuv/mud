inherit ROOM;

void create()
{
	set("short", "药铺");
	set("long", @LONG
这里是一家药铺，一股浓浓的药味让你几欲窒息，那是从
药柜上的几百个小抽屉里散发出来的。神医华陀二世坐在茶几
旁，独自喝着茶，看也不看你一眼。一名小伙计站在柜台后招
呼着顾客。
LONG);
	set("objects", ([
		__DIR__"npc/huatuo" : 1,
		__DIR__"npc/huoji" : 1,
	]));
	set("exits", ([
		"east" : __DIR__"beidajie2",
	]));

	setup();
	replace_program(ROOM);
}

