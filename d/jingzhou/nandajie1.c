inherit ROOM;

void create()
{
	set("short", "南大街");
	set("long", @LONG
南大街乃是城里的繁华地段，北边是一个热闹的广场。东
边是一家打铁铺。西边是荆州的驿馆，过往的路人多半都在这
里歇歇脚。
LONG);
        set("outdoors", "jingzhou");
	set("exits", ([
                "east" : __DIR__"datiepu",
		"south" : __DIR__"nandajie2",
                "west" : __DIR__"chaliao",
		"north" : __DIR__"guangchang",
	]));
        set("objects", ([
                "/d/beijing/npc/youke" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

