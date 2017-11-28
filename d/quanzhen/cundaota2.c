#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "存道塔二层");
        set("long", @LONG
这里是存道塔的二层，塔梯绕着塔内向塔顶延伸。这里空
空如也，经书也许全被全真弟子们借去阅读了。
LONG);
        set("exits", ([
                "eastup" : __DIR__"cundaota3",
                "eastdown" : __DIR__"cundaota1",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
