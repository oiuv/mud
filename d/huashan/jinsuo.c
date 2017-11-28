// jinsuo.c
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "金锁关");
        set("long", @LONG
金锁关山势形如一把锁，下面是一片开阔地，两旁是高耸入云的峭壁，中间
一条羊肠小道。真是一夫当关，万夫莫开。
LONG
        );
        set("exits", ([ /* sizeof() == 4 */
           "southup"   : __DIR__"zhenyue",
           "northdown" : __DIR__"shangtianti",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "huashan");
        setup();
        replace_program(ROOM);
}

