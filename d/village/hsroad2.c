inherit ROOM;

void create()
{
        set("short", "青石大道");
        set("long", @LONG
你走在一条青石大道上，南边隐约可见到洛阳城的城墙。北面两条土
路分岔通向山里。
LONG);
        set("outdoors", "village");
        set("exits", ([
                "south"     : __DIR__"hsroad1",
                "northwest" : __DIR__"hsroad3",
                "northeast" : "/d/huashan/jzroad1",
        ]));

        setup();
        replace_program(ROOM);
}

