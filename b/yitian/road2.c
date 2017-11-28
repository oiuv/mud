#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "黄土路");
        set("long", @LONG
你走在一条蜿蜒的小路上，北面就是万安寺了。
LONG );
        set("exits", ([
                "north" : __DIR__"road3",
                "west" : __DIR__"road1",
        ]));

        set("outdoors", "beijing");
        setup();
}
