#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIW "【通天门】" NOR);
        set("long", HIW @LONG
你来到这里，发现这里茫茫一片云海。眼前一座宏伟的敞开的大
门，大门的柱子旁依偎着一位男子，似乎对你的到来毫不在意。
LONG NOR );
        set("exits", ([
                "enter" : __DIR__"sky1",
]));
        set("sleep_room", 1);
        set("objects", ([
                __DIR__"npc/tianshen": 1,
        ]));

        setup();
}

