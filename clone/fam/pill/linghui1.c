#include <ansi.h>
#include "pill.h"

void create()
{
        set_name(HIY "昊天果" NOR, ({ "haotian guo", "haotian", "guo" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "这是一枚金黄色的果实，服用后能增加人的灵慧。\n" NOR);
                set("base_unit", "枚");
                set("base_value", 6000);
                set("base_weight", 80);
                set("only_do_effect", 1);

        }
        setup();
}

int do_effect(object me)
{
        int na, un;

        na = query("name");
        un = query("base_unit");

        if (time() - me->query_temp("last_eat/dan(linghui)") < 100)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }
        me->set_temp("last_eat/dan(linghui)", time());

        message_vision(HIY "$N" HIY "一仰脖，吞下了一" + un + na +
                       HIY "。\n" NOR, me);
        me->add("magic_points", 5 + random(6));

        me->start_busy(3);
        add_amount(-1);

        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}
