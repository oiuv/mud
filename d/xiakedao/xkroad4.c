inherit ROOM;

void create()
{
	set("short", "南海渔村");
	set("long", @LONG
这是南海沿岸的偏僻小村，稀稀落落的几户人家。空地上晾着几
顶渔网。南面就是波涛浩淼的南海了。向西走好象还有个渔港。东面
是小村的沙滩晒网场。
LONG );
        set("outdoors", "nanhai");
	set("exits", ([
		"north"   : __DIR__"xkroad3",
                "south"   : __DIR__"haibin",
		"east"    : __DIR__"xkroad5",
		"west"    : __DIR__"haigang",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

