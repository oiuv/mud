// manjuelong.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "满觉陇");
        set("long", @LONG
山路旁有一个小村落，村落四周桂花成林。每当仲秋，桂花盛开，
飘香数里。被称为“金雪世界”。西上是水乐洞，东下石屋洞。
LONG);
        set("exits", ([
                "westup"    : __DIR__"shuiledong",
                "eastdown"  : __DIR__"shiwudong",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

