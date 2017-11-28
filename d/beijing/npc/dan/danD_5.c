#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name(RED"血麒丹"NOR, ({"xueqi dan", "dan"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("base_unit", "粒");
                set("base_value", 90);
                set("only_do_effect", 1);
        }
        setup();
        set_amount(1);
}

int do_effect(object me)
{
        mapping my;
        int nl, mn;

        if (time() - me->query_temp("last_eat/dan(D)") < 180)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        my = me->query_entire_dbase();
        nl = (int)me->query("neili") + 1000;
        mn = (int)me->query("max_neili") * 2;

        if (nl > mn)
        {
                write("你现在内力修为无需服用" + name() + "。\n");
                return 1;
        }

        me->set_temp("last_eat/dan(D)", time());

        message_vision(RED "$N吃下一粒血麒丹，内力得到了完全的补充。\n" NOR, me);
        me->add("neili", 1000);

        me->start_busy(3);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}
