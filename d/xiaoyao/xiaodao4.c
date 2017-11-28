inherit ROOM;

void create()
{
        set("short", "林间小道");
        set("long", @LONG
这是一条长长的林间小道，从东边一直通到西边，一眼望
去，看不到路的尽头。两旁百花争艳。令人留连忘返。
LONG);
        set("exits", ([
                "east" : __DIR__"shulin1",
                "west" : __DIR__"qingcaop",
                "north" : __DIR__"liangong",
                "south" : __DIR__"mubanlu",
        ]));

        set("objects", ([
                CLASS_D("xiaoyao") + "/goudu" : 1,
        ]));

        set("outdoors", "xiaoyao");
        setup();
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (dir !="west")
                return 1;

        if (! objectp(guarder = present("gou du", this_object())))
                return 1;

        return guarder->permit_pass(me, dir);
}

