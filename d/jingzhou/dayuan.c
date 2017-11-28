inherit ROOM;

void create()
{
	set("short", "大院");
	set("long", @LONG
你走进大院，迎面是一个假山水池，池上摆着一块奇形怪
状的石头，据说是当年花石纲的遗石。水池的两旁种满了花草。
东边是一棵槐树，郁郁葱葱，遮盖了大半个院子。
LONG);
	set("exits", ([
		"south" : __DIR__"wanghouse",
		"west"  : __DIR__"xting",
		"east"  : __DIR__"dting",
		"north" : __DIR__"whouyuan",
	]));

	setup();
	replace_program(ROOM);
}

