inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
你走在一山路上，四周有一座座小山丘。能遥望见西南方
大雪山的北麓。山前隐隐约约象是有一座寺院。
LONG);
        set("exits", ([
                "west" : __DIR__"nroad3",
                "east" : __DIR__"nroad1",
        ]));
        set("objects", ([
                "/d/wudang/npc/guest" : 1,
        ]));
        set("outdoors", "xuedao");
        setup();
        replace_program(ROOM);
}

