// Room: /d/mingjiao/donglu.c

#include <room.h>
inherit ROOM;

void create()
{
    set("short", "昆仑山麓");
    set("long", @LONG
这里是千里昆仑的东麓，由于树木高大茂盛，遮天盖地，甚
是阴暗。北面隐隐有条小路，但是看来许久未曾有人走过，颇为
荒凉阴森。
LONG );
    set("exits", ([
        "south" : __DIR__"shanjiao",
        "north" : __DIR__"youjing",
    ]));

    set("outdoors", "mingjiao");
    setup();
}

int valid_leave(object me, string dir)
{
        if (! userp(me) && dir == "north")
                return 0;

        return ::valid_leave(me, dir);
}
