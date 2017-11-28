#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "日月侧洞");
        set("long", @LONG
这里是星宿派总舵所在地日月洞侧洞。只见漆黑一片，唯
有前方不员处有些许光线，看来可以从这出去。
LONG);
        set("exits", ([
             "out" : __DIR__"xxh1",
        ]));

        setup();
        replace_program(ROOM);

}

