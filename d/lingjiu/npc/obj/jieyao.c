#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIC "药丸" NOR, ({"yao wan", "yao", "wan"}));
        set_weight(20);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIC "一颗浑圆的药丸，乃是乌老大所配制的独门解药。\n" NOR);
                set("unit", "颗");
                set("value", 300);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        message_vision(HIC "$N" HIC "一仰脖，吞下一颗药丸。\n" NOR, me);
        if ((int)me->query_condition("lb_poison"))
        {
                me->clear_condition("lb_poison");
                me->start_busy(2);
                tell_object(me, HIY "你感到内息一畅，体内的绿波剧毒开始慢慢消退。\n" NOR);

        }
        destruct(this_object());
        return 1;
}
