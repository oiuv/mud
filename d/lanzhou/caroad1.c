inherit ROOM;

void create()
{
        set("short", "青石大道");
        set("long", @LONG
你走在一条青石大道上，人来人往非常繁忙，不时地有人
骑着马匆匆而过。大道两旁有一些小货摊，北行不远就可以到
达兰州了，南边通往长安。
LONG);
        set("outdoors", "lanzhou");

        set("exits", ([
                "north" : __DIR__"nanmen",
                "south" : __DIR__"caroad2",
        ]));
        set("objects", ([
                "/d/beijing/npc/tiaofu" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
