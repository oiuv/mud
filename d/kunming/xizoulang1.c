#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "西走廊");
        set("long", @LONG
这里是一条干净的走廊，从两面看去，可以欣赏到花园里
的风景，只见各种假山怪石，奇花异草，足见王府之气派。西
边是平西王最爱去的书房，门口有几名亲兵在把守。
LONG);
        set("exits", ([
                "west"   :__DIR__"shufan",
                "east"   :__DIR__"xizoulang"
        ]));

        set("objects",([
                __DIR__"npc/qinbing" : 2,
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        if (dir == "west" &&
           objectp(present("qin bing", environment(me))))
                return notify_fail(CYN "亲兵拦住你说道：王爷吩咐了，没有他"
                                   "的允许，任何人不得进入打扰。\n" NOR);                
        return ::valid_leave(me, dir);
}
