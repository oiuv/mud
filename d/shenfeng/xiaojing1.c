inherit ROOM;

#include "langqun.h"

void create()
{
        set("short", "小径");
        set("long", @LONG
这条道路不知已有多少年无人行走，有些地方长草比人还
高，有些地方又全被沙堆阻塞，四下如死一般的寂静，只有风
吹过草梢的沙沙之声。偶尔一两声狼嚎随着腥风飘至耳际。
LONG);
        set("exits", ([ 
                "south" : __DIR__"bridge2",
                "north" : __DIR__"shibi",
        ]));

        set("quarrys", ([
                "lang2" : 200000,
                "lang"  : 100000,
        ]));

        setup();
}
