inherit ROOM;
void create()
{
        set("short", "北大街");
        set("long", @LONG
你走在一条繁忙的街道上，看着操着南腔北调的人们行色
匆匆，许多人都往南边走去，那里有一个热闹的广场。东边是
一个热闹的菜市场，买卖的人熙熙攘攘。
LONG);
        set("outdoors", "lanzhou");
        set("exits", ([
                "east" : __DIR__"caisicang",
                "south" : __DIR__"guangchang",
                "north" : __DIR__"beidajie2",
        ]));
        set("objects", ([
                "/d/gaochang/npc/liwenxiu" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
