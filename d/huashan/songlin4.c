// Room: /d/huashan/songlin3.c

inherit ROOM;

void create()
{
        set("short", "松树林");
        set("long", @LONG
这是一片松树林。几丈高的松树密密麻麻，遮得不见天日。地上
落满松针，有不知名的野兔偷偷逃过。四周一片寂静。
LONG );
        set("exits", ([
                "south" : __DIR__"songlin" + (random(4) + 1),
                "north" : __DIR__"songlin1",
                "east"  : __DIR__"songlin" + (random(4) + 1),
                "west"  : __DIR__"songlin" + (random(4) + 1),
        ]));
        set("objects", ([
                __DIR__"npc/lin-pingzhi": 1,
        ]));

        set("outdoors", "huashan");
        setup();
        replace_program(ROOM);
}

