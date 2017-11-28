// Room: /d/huashan/jzroad6.c

#include <room.h>
inherit ROOM;

void create()
{
        set("short", "树林外");
        set("long", @LONG
树林外，赫然站着一个汉子，在阴森森的林子边上，凭添一股煞
气。西上是登山的路，东边就进入森林了。
LONG );
        set("exits", ([ /* sizeof() == 4 */
            "enter"   : __DIR__"jzroad5",
            "westup"  : __DIR__"jzroad7",
        ]));
        set("objects", ([
             CLASS_D("huashan") + "/cheng-buyou": 1,
        ]));
//        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

