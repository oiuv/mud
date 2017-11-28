inherit ROOM;
void create()
{
        set("short", "北大街");
        set("long", @LONG
你走在一条繁忙的街道上，看着操着南腔北调的人们行色
匆匆，许多人都往南边走去，那里有一个热闹的广场。西边是
一个小吃馆，阵阵香味飘来，让你直流口水。
LONG);
        set("outdoors", "lanzhou");
        set("exits", ([
                "west" : __DIR__"xiaochidian",
                "east" : __DIR__"majiu",
                "south" : __DIR__"beidajie1",
                "north" : __DIR__"beimen",
        ]));
        set("objects", ([
                "/d/beijing/npc/kid1" : 1,
                "/d/beijing/npc/old1" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
