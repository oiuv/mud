inherit ROOM;

void create()
{
	set("short", "药铺");
	set("long", @LONG
这是一家药铺，一股浓浓的药味让你几欲窒息，那是从药
柜上的几百个小抽屉里散发出来的。神医平一指坐在茶几旁独
自喝着茶，看也不看你一眼。
LONG );
	set("objects", ([
		"/d/city/npc/ping" : 1,
	]));
        set("no_fight", 1);     
        set("no_sleep_room", 1);
	set("exits", ([
		"east" : __DIR__"road",
	]));
	setup();
	replace_program(ROOM);
}
