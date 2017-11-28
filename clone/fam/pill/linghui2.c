#include <ansi.h>
#include "pill.h"

void create()
{
        set_name(HIW "昊天丹" NOR, ({ "haotian dan", "haotian", "dan" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "这是一颗精炼而成的昊天丹，服用后能增加灵慧。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 10000);
                set("base_weight", 50);
                set("only_do_effect", 1);

        }
        setup();
}

int do_effect(object me)
{
        int na, un;

        na = query("name");
        un = query("base_unit");

        if (time() - me->query_temp("last_eat/dan(linghui)") < 200)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }
        me->set_temp("last_eat/dan(linghui)", time());

        message_vision(HIY "$N" HIY "一仰脖，吞下了一" + un + na +
                       HIY "。\n" NOR, me);
        me->add("magic_points", 12 + random(14));

        me->start_busy(3);
        add_amount(-1);

        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}
