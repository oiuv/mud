inherit ROOM;

void create()
{
	set("short", "天中阁");
	set("long", @LONG
天中阁是中岳庙的大门，原称黄中阁。庙内有古柏三百余
株，金石碑碣百余座。庙前石翁仲，雕制古朴。南面是嵩山的
出口太室阙。
LONG );
	set("outdoors", "songshan");
	set("exits", ([
		"north" : __DIR__"chongsheng",
		"south" : __DIR__"taishique",
	]));

        set("objects", ([
                __DIR__"npc/seller" : 1,
                "/clone/npc/walker" : 1,
        ]));

	setup();
	replace_program(ROOM);
}

