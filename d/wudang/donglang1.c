#include <room.h>
inherit ROOM;

void create()
{
        set("short", "东厢走廊");
        set("long", @LONG
你走在一条走廊上，东边有几间雅室，人来人往很是热闹。
西边则是武当派的大殿。
LONG );
        set("exits", ([
                "east" : __DIR__"donglang2",
                "west" : __DIR__"sanqingdian",
        ]));
        set("objects", ([
                CLASS_D("wudang") + "/xi" : 1
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (dir != "east")
                return 1;

        if (! objectp(guarder = present("zhang songxi", environment(me))))
                return 1;

        return guarder->permit_pass(me, dir);
}
