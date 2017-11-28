#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name(HIM"龙涎丹"NOR, ({"longxian dan", "dan"}));
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

        if (me->improve_neili(1))
        {
                message_vision(HIM "$N" HIM "吃下一粒龙涎丹，脸上闪过一道紫气。\n" NOR, me);
                tell_object(me, "你感到内力又雄厚了一些。\n");
                me->add("max_neili", 1);
        } else
        {
                message_vision(HIC "$N" HIC "吃下一粒龙涎丹，脸色变了变，闪过一丝青气。\n" NOR, me);
                tell_object(me, "你感到内息澎湃，难以吸收丹药的效力。\n");
        }

        me->start_busy(6);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}
