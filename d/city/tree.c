#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "大榕树上");
        set("long", @LONG
这里是大树的顶端，四周全是浓密的枝叶和湿漉漉的苔藓。
一阵微风吹来，树叶发出唰啦啦的声音。从上面望下去你只觉
得一阵眼晕，心想还是赶快下去吧。
LONG);
        set("outdoors", "city");
        set("item_desc", ([
                "tree" : GRN "\n这是一棵巨大古老的大榕"
                         "树，枝叶非常的茂密。\n" NOR,
        ]));
        set("exits", ([
                "down" : __DIR__"guangchang",
        ]));
        set("objects", ([
               CLASS_D("xiakedao") + "/shi" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
