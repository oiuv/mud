inherit ROOM;

void create()
{
	set("short", "东大街");
	set("long", @LONG
你走在东大街上，踩着坚实的青石板地面。东边不远是东
城门，可以听到守城官兵的吆喝声，与西边朗朗的读书声混杂
在一起。北边是一家小小的杂货铺。
LONG);
        set("outdoors", "jingzhou");
	set("exits", ([
		"east" : __DIR__"jzdongmen",
		"west" : __DIR__"dongdajie1",
		"north" : __DIR__"shop",
		"south" : __DIR__"xxiang",
	]));
        set("objects", ([
                "/d/beijing/npc/boy3" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

