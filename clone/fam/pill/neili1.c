#include <ansi.h>
#include "pill.h"

void create()
{
        set_name(HIR "朱果" NOR, ({ "zhu guo", "zhu", "guo", "zhuguo" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIR "这是一枚火红色的朱果，能起到调息内力的作用。\n" NOR);
                set("base_unit", "枚");
                set("base_value", 3000);
                set("base_weight", 80);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        int na, un;
        mapping my;

        na = query("name");
        un = query("base_unit");

        if (time() - me->query_temp("last_eat/dan(D)") < 240)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        if (me->query("neili") >= me->query("max_neili"))
        {
                write("你现在内力修为无需服用" + name() + "。\n");
                return 1;
        }

        my = me->query_entire_dbase();

        me->set_temp("last_eat/dan(D)", time());

        message_vision(HIY "$N" HIY "吞下一" + un + na + HIY "，内息得到了"
                       "完全的补充。\n" NOR, me);

        my["neili"] = my["max_neili"];

        me->start_busy(3);
        add_amount(-1);

        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}
