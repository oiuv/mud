// xiandan.c 仙丹

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIY "福缘丹" NOR, ({ "fuyuan dan", "fuyuan", "dan" }) );
        set_weight(200);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "一颗圆圆的仙丹，据说吃了可以增加福缘。\n");
                set("value", 10000);
                set("unit", "粒");
                set("only_do_effect", 1);
        }
}

int do_effect(object me)
{
        message_vision("$N一仰脖，吞下了一粒" + this_object()->name() +
                       "。\n", me);
        if (me->query("kar") >= 30)
        {
                message_vision("$N忽然“哇哇”，吐了一地。\n", me);
                tell_object(me, "你觉得嘴里非常的苦。\n");
        } else
        {
                tell_object(me, HIG "你觉得你的运气开始好起来了。\n" NOR);
                me->add("kar", 1);
        }

        destruct(this_object());
        return 1;
}
