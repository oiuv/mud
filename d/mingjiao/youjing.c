// Room: /d/mingjiao/donglu.c

#include <room.h>
inherit ROOM;

int query_rate();

void create()
{
        set("short", "昆仑幽境");
        set("long", @LONG
这里都是一些千年古木，极其高大茂盛，人迹罕至，荒凉无比。
你隐隐然感觉有些寒气，颇不舒服，还是赶快离开这里为好。
LONG );
        set("exits", ([
                "south" : __DIR__"donglu",
        ]));

        set("insects/bingcan", (: query_rate :));

        set("outdoors", "mingjiao");
        setup();
}

int query_rate()
{
       // object me;

        if (present("shenmu wangding", this_object()))
                return 3000;
        else
                return 500;

        return 0;
}
