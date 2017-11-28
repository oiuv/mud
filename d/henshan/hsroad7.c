inherit ROOM;

void create()
{
        set("short", "林间大道");
        set("long", @LONG
这里是一条林间大道，在树丛中蜿蜒。这里已是湖北境内。
南边是便湖南。
LONG);
        set("outdoors", "hengyang");

        set("exits", ([
                "north"  : __DIR__"hsroad8",
                "south"  : __DIR__"hsroad6",
        ]));
        set("objects", ([
                "/clone/quarry/gou" : 1,
        ]));

        setup();
        replace_program(ROOM);
}

