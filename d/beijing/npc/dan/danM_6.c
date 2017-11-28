#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name(HIC"映月丹"NOR, ({"yingyue dan", "dan"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("base_unit", "粒");
                set("base_value", 100);
                set("only_do_effect", 1);
        }
        setup();
        set_amount(1);
}

int do_effect(object me)
{
        mapping my;

        if (time() - me->query_temp("last_eat/dan(M)") < 400)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        my = me->query_entire_dbase();

        me->set_temp("last_eat/dan(M)", time());

        if (me->improve_jingli(1))
                message_vision(HIC "$N吃下一粒映月丹，感到精力修为比以前有所提高。\n" NOR, me);
        else
                message_vision(HIC "$N吃下一粒映月丹，感觉好像没什么效果。\n" NOR, me);

        me->start_busy(2);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}
