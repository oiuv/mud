inherit ROOM;

void create()
{
        set("short", "高昌迷宫");
        set("long", @LONG
这是条黑沈沈的长甬道，甬道前出现了三条岔道。迷宫之
内并无足迹指引，你不知道要往哪条路走。俯身细看，见左首
右首和前方三条路上都有淡淡的足迹。
LONG);

        set("exits", ([
                "west" : __DIR__"shulin" + (random(10) + 2),
                "east" : __DIR__"shulin2",
                "north" : __DIR__"shulin" + (random(10) + 2),
                "south" : "/d/shenfeng/caoyuan7",
        ]));

        set("outdoors", "gaochang");
        set("objects", ([
                __DIR__"npc/ghost" : 3,
        ]));
        setup();
        replace_program(ROOM);
}

