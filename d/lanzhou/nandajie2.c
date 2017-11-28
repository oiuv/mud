inherit ROOM;
void create()
{
        set("short", "南大街");
        set("long", @LONG
你走在一条繁忙的街道上，看着操着南腔北调的人们行色
匆匆，许多人都往北边走去，那里有一个热闹的广场。
LONG);
        set("outdoors", "lanzhou");
        set("exits", ([
                "south" : __DIR__"nanmen",
                "north" : __DIR__"nandajie1",
        ]));
        set("objects", ([
                "/d/beijing/npc/girl4" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
