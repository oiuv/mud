#include <ansi.h>
#include "pill.h"

void create()
{
        set_name(HIR "火龙果" NOR, ({ "huolong guo", "huolong", "guo" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIR "这是一枚拳头大小的火龙果，能起到调息内力的作用。\n" NOR);
                set("base_unit", "枚");
                set("base_value", 8000);
                set("base_weight", 100);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        int na, un;

        na = query("name");
        un = query("base_unit");

        if (time() - me->query_temp("last_eat/dan(D)") < 400)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        if (me->query("neili") >= me->query("max_neili") * 2)
        {
                write("你现在内力修为无需服用" + name() + "。\n");
                return 1;
        }

        me->set_temp("last_eat/dan(D)", time());

        message_vision(HIY "$N" HIY "吞下一" + un + na + HIY "，双目顿时精"
                       "光四射。\n" NOR, me);

        me->set("neili", me->query("max_neili") * 2);

        me->start_busy(5);
        add_amount(-1);

        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}
