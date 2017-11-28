// energy stone.c

#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIY "能量石" NOR, ({"energy stone", "stone"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "一块精光闪闪的能量石。\n" NOR);
                set("unit", "块");
                set("value", 50000);
                set("weight", 40);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
       // mapping my;

        if (! me->is_magic_beast())
        {
                write("你疯了啊，能量石也能吃吗？\n");
                return 1;
        }

        me->set("food", 8*me->max_food_capacity());
        me->set("water",8*me->max_water_capacity());
        // me->start_busy(1);
        message_vision(HIR "$N" HIR "吃下了一块能量石，顿时全身泛起红光！\n"NOR,me);

        destruct(this_object());

        return 1;
}

