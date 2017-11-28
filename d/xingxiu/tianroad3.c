#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "天山山路");
        set("long", @LONG
这里是天山东麓，山风从山上吹来，你冷得瑟瑟发抖。路
边是一片草原。西面一条深涧(valley)挡住了上山的路。
LONG );
        set("exits", ([
                "northup" : __DIR__"xxroad4",
                "eastdown" : __DIR__"xxh1",
        ]));
        set("item_desc", ([
                "valley" : WHT "\n深涧足有三丈多宽，不知道能不能跳过去。\n" NOR,
        ]));
        set("objects", ([
                CLASS_D("xingxiu") + "/azi" : 1,
        ]));
        set("outdoors", "xingxiu");
        setup();
}

void init()
{
        add_action("do_jump", "jump");
        add_action("do_jump", "tiao");
}

int do_jump(string arg)
{
        object me;
        me = this_player();

        if (! arg || arg != "valley")
                return notify_fail("你要往哪跳？\n");

        message_vision(HIY "\n$N" HIY "豫了一下，鼓气勇气，朝着对面的山崖跳了过"
                       "去。\n\n" NOR, me);

        if ((int)me->query_skill("dodge", 1) < 150 )
        {
                me->move(__DIR__"shanjiao");
                me->receive_wound("qi", 300);
                me->unconcious();
                message("vision", HIR "\n突然听得「砰」的一声，只见一个人从上面"
                                  "的山峰上坠了下来，真是壮观。\n" NOR,
                                  environment(me), ({me}));
        } else
        {
                me->move(__DIR__"tianroad4");
                message("vision", HIY "\n只见" + me->name() + HIY "从对面的山崖"
                                  "上跳了过来。\n" NOR, environment(me), ({me}));
        }
        return 1;
}
