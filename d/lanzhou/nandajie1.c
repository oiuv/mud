inherit ROOM;
void create()
{
        set("short", "南大街");
        set("long", @LONG
你走在一条繁忙的街道上，看着操着南腔北调的人们行色
匆匆，许多人都往北边走去，那里有一个热闹的广场。东边传
来一阵阵银两撞击的声音，那儿有一家老字号的银号。
LONG);
        set("outdoors", "lanzhou");
        set("exits", ([
                "south" : __DIR__"nandajie2",
                "north" : __DIR__"guangchang",
                "east" : __DIR__"qianzhuang",
        ]));
        set("objects", ([
                "/d/beijing/npc/richman1" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
