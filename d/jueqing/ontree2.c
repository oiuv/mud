#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", NOR + RED "大枣树上" NOR);
        set("long", @LONG
这里是石窟内的一棵百仗高的大枣树上，但见此处被树叶
所盖，密不透风。
LONG);
        set("exits", ([
              "up"    :  __DIR__"ontree3",
              "down"  :  __DIR__"ontree1",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

