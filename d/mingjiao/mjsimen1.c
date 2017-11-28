// Room: /d/mingjiao/mjsimen1.c
// Date: Java 97/05/11

#include <room.h>
inherit ROOM;

void create()
{
    set("short", "广场");
    set("long", @LONG
这里是一片庭院中央的广场，整个广场由大块的青石铺成，
极为平坦。但因年代久远，都有些破损。丛丛小草从石板的缝
隙中长了出来。广场四面有几条小道，通向明教的“天地风雷”
四门。
LONG );
    set("exits", ([
        "north"     : __DIR__"mjsimen",
        "northwest" : __DIR__"mjtianmen",
        "northeast" : __DIR__"mjdimen",
        "southeast" : __DIR__"mjfengmen",
        "southwest" : __DIR__"mjleimen",
    ]));
    set("outdoors", "mingjiao");
    set("no_clean_up", 0);
    setup();
    replace_program(ROOM);
}

