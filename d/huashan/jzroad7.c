// Room: /d/huashan/jzroad7.c

#include <room.h>
inherit ROOM;

void create()
{
        set("short", "峭壁");
        set("long", @LONG
你走在峭壁边的小路上。一侧是密密的丛林，外侧却是极深的陡
壁。山风凛冽，几乎要把你刮落崖去。
LONG );
        set("exits", ([ /* sizeof() == 4 */
            "eastdown" : __DIR__"jzroad6",
            "southup"  : __DIR__"shangu",
        ]));
        set("outdoors", "huashan");
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

