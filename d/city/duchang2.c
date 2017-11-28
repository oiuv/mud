inherit ROOM;

void create()
{
	set("short", "赌场");
	set("long", @LONG
这里是赌场的二楼，有四条走廊通向不同的房间。四周的
赌房里传出来吆五喝六的赌博声。赌场规模虽算不上大，但赌
的种类却很齐全，服务也非常周到。在这里，世上的各行各色
的人夹杂在一起。
LONG );
	set("exits", ([
		"east"  : __DIR__ "eproom",
		"west"  : __DIR__ "wproom",
		"south" : __DIR__ "sproom",
		"north" : __DIR__ "nproom",
		"down"  : __DIR__"duchang",
		//"up"  : __DIR__"duchang3",
	]));
        set("objects", ([
                "/d/beijing/npc/duke" : 2,
                "/d/beijing/npc/dipi" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

