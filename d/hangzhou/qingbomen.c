// qingbomen.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "清波门");
        set("long", @LONG
园门口有一大门楼，大匾上刻着“清波门”。门楼下站着几个嬉
嬉哈哈的少女，惹人坠步相观。在往西就进了聚景，往东便回到大路。
LONG);
        set("exits", ([
            "east"   : __DIR__"road14",
            "west"   : __DIR__"jujingyuan",
        ]));
        set("objects", ([
            __DIR__"npc/girl" : 2,
        ]));
        set("outdoors", "hangzhou");
//        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
