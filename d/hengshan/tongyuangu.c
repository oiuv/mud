// Room: /d/hengshan/tongyuangu.c
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "通元谷");
        set("long", @LONG
通元谷孤处见性峰下，相传为张果老成仙前修道之所，由于他
道号 "通元" ，这里也就成了通元谷。
LONG);
        set("exits", ([ /* sizeof() == 4 */
           "eastup"  : __DIR__"guolaoling",
        ]));
        set("outdoors", "hengshan");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

