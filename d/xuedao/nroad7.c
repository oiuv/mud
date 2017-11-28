inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
你走在一山路上，四周有一座座小山丘。
LONG );
        set("exits", ([
                "eastdown" : "/d/xueshan/shanjiao",
                "south"    : __DIR__"nroad6",
        ]));
        set("outdoors", "xuedao");
        setup();
        replace_program(ROOM);
}

