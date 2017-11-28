#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "黄土路");
        set("long", @LONG
你走在一条蜿蜒的小路上，北面就是万安寺了，戒备很是深严。
LONG );
        set("exits", ([
                "north" : "/d/tulong/yitian/was_damen",
                "south" : "/d/tulong/yitian/road2",
        ]));

        set("objects", ([
                "/d/tulong/yitian/npc/bing1" : 10,
        ]));

        set("outdoors", "beijing");
        setup();
}
