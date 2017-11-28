inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
你走在一山路上，四周有一座座小山丘。远处可以看见终
年积雪的山尖。周围的树草已经很难看得到了。
LONG);
        set("exits", ([
                "north" : __DIR__"nroad7",
                "south" : __DIR__"nroad5",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "xuedao");
        setup();
        replace_program(ROOM);
}

