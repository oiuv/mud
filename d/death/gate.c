#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", HIR "【鬼门关】" NOR);
        set("long", HIR @LONG

                    鬼         门         关

    这里就是著名的阴间入口「鬼门关」，在你面前矗立著一座高大的
黑色城楼，许多亡魂正哭哭啼啼地列队前进，因为一进鬼门关就无法再
回阳间了。


LONG NOR );
        set("exits", ([
                "north" : __DIR__"gateway",
        ]) );
        set("objects", ([
                __DIR__"npc/bai":1,
                __DIR__"npc/ghost":1,
        ]) );

        set("no_fight", 1);
        set("no_magic", 1);
        set("no_sleep_room", 1);

        setup();
        replace_program(ROOM);
}
