// chashi.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "茶室");
        set("long", @LONG
这里是龙井茶茶室。在这里可以品到最新鲜的龙井。
LONG);
        set("exits", ([
                "west"     : __DIR__"longjing",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
