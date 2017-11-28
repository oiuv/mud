#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", HIR "【 地 阴 】" NOR);
        set("long", HIR @LONG

                       地            阴

    这里便是阴间的最深处「地阴」，你面前是一个无底深渊，深渊内
侧悬浮着一块血红色的巨大晶体(jingti)，时明时暗，散发出暗淡的血
红色光芒，投射着丝丝热量。也许这就传说中的「地阴血脉」吧。

LONG NOR );
        set("exits", ([
                "up" : __DIR__"diyin_road2",
        ]) );

        set("item_desc", ([
                "jingti" : RED "一块血红色的巨大晶体，发出血色光"
                           "芒，你忍不住想敲(qiao)一块下来。\n" NOR,
        ]));

        set("no_sleep_room", 1);

        setup();
}

void init()
{
        add_action("do_qiao", "qiao");
}

int do_qiao(string arg)
{
        object me = this_player();
        object ob;

        if( (!arg) || !((arg == "jingti") || (arg == "晶体")))
                return notify_fail("你要敲什么？\n");

        message_vision(HIW "\n$N" HIW "一跃而起，飞身一掌劈在血红色晶体一侧。\n" NOR, me);
 
        if(query("not_xuemai") || me->query("combat_exp") < 1500000 )
        {
                message("vission", HIY "可是晶体只是轻微的晃动了一下，再没其它反应。\n" NOR, me);
                return 1;
        }
        ob = new(__DIR__"obj/diyin");
        ob->move( environment(me) );
        message_vision(HIR "只见晶体受震，「喀嚓」一声，一小块晶体碎片落在了地上。\n" NOR, me);
        set("not_xuemai", 1);
        remove_call_out("regenerate"); 
        call_out("regenerate", 86400);
        return 1;
}

int regenerate()
{
        set("not_xuemai", 0);
        return 1;
} 

