inherit ROOM;

void create()
{
	set("short","苍山中部");
	set("long",@LONG
你行走在苍山中部的山颠，此间地形极险，两边山高入
云，中间一条崎岖不平的山路。路西不远一条大河自北略偏
西方向南流过，隆隆水声遥遥可闻，正是南诏名川泸水。此
路是自西川和土番入大理的必经之途，时有客商过往。由此
向南穿越苍山可抵下关城，北面不远则是出苍山的山口。
LONG);
	set("outdoors", "dali");
	set("exits", ([
                "north"     : __DIR__"jianchuan",
                "southwest" : __DIR__"cangshanlu1",
                "southeast" : __DIR__"xiaguan",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

