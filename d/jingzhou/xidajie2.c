inherit ROOM;

void create()
{
	set("short", "西大街");
	set("long", @LONG
这是一条宽阔的青石板街道，向东西两头延伸。行人络绎
不绝，北边是当地有名的关圣庙，东边有一个热闹的广场。
LONG);
        set("outdoors", "jingzhou");
	set("exits", ([
		"east" : __DIR__"xidajie1",
		"west" : __DIR__"jzximen",
		"north" : __DIR__"guanmiao",
                "south" : __DIR__"lydao1",
	]));
        set("objects", ([
                "/d/beijing/npc/hunhun" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
