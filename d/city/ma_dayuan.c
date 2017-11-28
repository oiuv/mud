inherit ROOM;

void create()
{
	set("short", "马庄大院");
	set("long", @LONG
你走进大院，迎面是一个假山水池，池上摆着一块奇形怪
状的石头，据说是当年花石纲的遗石。水池的两旁种满了花草。
东边是一棵槐树，郁郁葱葱，遮盖了大半个院子。前方是一条
长廊走道通往后院，有几个丐帮弟子把守。
LONG);
        set("outdoors", "city");
	set("exits", ([
                "east"  : __DIR__"ma_chufang",
		"north" : __DIR__"ma_houyuan",
		"south" : __DIR__"ma_damen",
	]));
        set("objects", ([
                "/d/gaibang/npc/3dai" : 1,
                "/d/gaibang/npc/4dai" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

