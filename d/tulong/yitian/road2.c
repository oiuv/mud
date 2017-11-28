#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "黄土路");
        set("long", @LONG
你走在一条蜿蜒的小路上，北面就是万安寺了。
LONG );
        set("exits", ([
                "north" : "/d/tulong/yitian/road3",
                "west" : "/d/tulong/yitian/road1",
        ]));

        set("outdoors", "beijing");
        setup();
}
