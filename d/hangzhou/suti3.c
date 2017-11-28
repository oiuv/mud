// suti3.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "苏堤");
        set("long", @LONG
寒冬，瑞雪霏霏中，不少游人踏雪观景。从堤上极目远眺，只见
四周玉树琼林。北边是东浦桥，南面是压堤桥。
LONG);
        set("exits", ([
            "north"     : __DIR__"suti2",
            "south"     : __DIR__"suti4",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
