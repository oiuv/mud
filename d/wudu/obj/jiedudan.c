inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(HIW "凝冰丹" NOR, ({"ningbing dan", "dan"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "粒");
                set("value", 3000);
                set("long", HIW "五毒教的神丹，能解蟾毒及砂毒。\n" NOR);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        message_vision(HIW "$N" HIW "仰脖吞下一粒凝冰丹。\n" NOR, me);

        if ((int)me->query_condition("tianchan_zhang")
           || (int)me->query_condition("sha_poison"))
        {
                if (me->query_condition("tianchan_zhang"))
                        me->clear_condition("tianchan_zhang");

                if (me->query_condition("sha_poison"))
                        me->clear_condition("sha_poison");

                me->start_busy(2);
                tell_object(me, HIC "你感到内息一畅，体内的毒素开始慢慢消退。\n" NOR);
        }
        destruct(this_object());
        return 1;
}
