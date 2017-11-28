inherit ROOM;

void create()
{
	set("short", "西大街");
	set("long", @LONG
这是一条宽阔的青石板街道，向东西两头延伸。这里行人
稀少，静悄悄地很是冷清。东边是一个热闹的广场。南边是荆
州府衙。北边是一座豪华大院，那就是万门万府了。
LONG);
        set("outdoors", "jingzhou");

	set("exits", ([
		"east" : __DIR__"guangchang",
		"south" : __DIR__"jzyamen",
		"west" : __DIR__"xidajie2",
		"north" : __DIR__"wanghouse",
	]));
        set("objects", ([
                "/d/beijing/npc/kid1" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

