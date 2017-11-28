inherit ROOM;

void create()
{
	set("short", "福州南门");
	set("long", @LONG
这里是福州南门，似乎没什么人来往，也没有官兵在这里把守。
LONG );
	set("exits", ([
		"south" : __DIR__"zhongzhou",
                "north" : __DIR__"nanmendou",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

