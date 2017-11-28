inherit ROOM;

void create()
{
	set("short", "丁字街口");
	set("long", @LONG
这里是襄阳城北部的丁字街口。向北一直通向玄武门，东
面和西面是一条笔直的青石大街，通向城内。南面是一堵上盖
红色琉璃瓦的高墙，里面是襄阳安抚使吕文德的府邸。
LONG );
        set("outdoors", "xiangyang");
	set("no_clean_up", 0);

	set("exits", ([
		"east"  : __DIR__"northroad2",
		"west"  : __DIR__"northroad1",
		"north" : __DIR__"northjie",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

