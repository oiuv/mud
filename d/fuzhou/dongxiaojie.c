inherit ROOM;

void create()
{
	set("short", "东小街");
	set("long", @LONG
街道两侧，榕木参天。福州盛夏苦热，广植榕树以纳凉
爽，别名“榕城”。东面就出城了，西面是城中心。
LONG );
	set("exits", ([
		"east"    : __DIR__"dongmen",
		"west"    : __DIR__"dongdajie",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

