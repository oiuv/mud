#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "老君殿");
        set("long", @LONG
这里是供奉太上老君的大殿。殿中塑着老君的塑像，老君
骑在青牛上，正临云而去。两旁塑着两个童子，栩栩如生。殿
中的地都是以青砖一块块的铺成，打扫得一尘不染。
LONG);
        set("exits", ([
                "east" : __DIR__"houtang1",
                "south" : __DIR__"tongtiandian",
                "north" : __DIR__"yuanshidian",
                "west" : __DIR__"datang3",
        ]));
        set("objects", ([
                CLASS_D("quanzhen") + "/qiu" : 1,
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (dir != "east")
                return 1;

        if (! objectp(guarder = present("qiu chuji", this_object())))
                return 1;

        return guarder->permit_pass(me, dir);
}
