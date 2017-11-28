#include <ansi.h>
inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name(HIY "玉蜂蜜" NOR, ({ "yufeng mi", "yufeng", "mi"}));
        set_weight(750);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "这是一罐玉蜂酿成的蜜，可解玉蜂毒。\n" NOR);
                set("unit", "罐");
                set("value", 500);
                set("no_sell", 1);
                set("mi_count", 5);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        if (query("mi_count") < 1)
        {
                write("罐子里的玉蜂蜜已经被喝得一滴不剩了。\n");
                return 1;
        }

        if (me->query("water") >= me->max_water_capacity()
           && me->query("food") >= me->max_food_capacity())
        {
                write("你已经吃太饱了，再也塞不下任何东西了。\n");
                return 1;
        }

        message_vision("$N拿起罐子，咕嘟咕嘟咽下几口玉蜂蜜。\n" NOR, me);
        me->add("food", 50);
        me->add("water", 50);

        if ((int)me->query_condition("yufengdu"))
        {
                me->clear_condition("yufengdu");
                tell_object(me, HIC "你只觉体内残存的玉蜂毒慢慢"
                                    "消退，气脉随之一畅。\n" NOR);
        }
        add("mi_count", -1);
        return 1;
}
