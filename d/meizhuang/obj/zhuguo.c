// zhuguo.c
#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIR "朱果" NOR, ({"zhu guo", "guo"}));
        set_weight(20);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "颗");
                set("long", "这是一颗朱果，通体鲜红，一望而知是不"
			    "可多得的珍品。\n");
                set("value", 10000);
		set("no_sell", "这个小红豆也能拿来卖？\n");
		set("only_do_effect", 1);
        }

        setup();
}

int do_effect(object me)
{
        me->set("qi", (int)me->query("eff_qi"));
        me->set("neili", (int)me->query("max_neili"));
        message_vision(HIR "$N" HIR "吃下一颗朱果，只觉饥渴全消，一股"
		       "暖流从丹田直冲上来。\n"NOR,me);

        destruct(this_object());
        return 1;
}

