#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "存道塔顶");
        set("long", @LONG
这里是存道塔的塔顶，塔梯到这里就到了尽头。墙壁上开
着几个窗户(window)，几个中年道人正捧着书苦苦研读。
LONG);
        set("exits", ([
                "eastdown" : __DIR__"cundaota3",
        ]));
        set("objects", ([
                __DIR__"npc/zhangjing" : 1,
        ]));

        set("item_desc", ([
                "window": HIW "\n窗外白云飘过，似乎你一伸手就可以抓住一片。\n" NOR,
        ]));

        set("count",1);
        setup();
        replace_program(ROOM);
}
