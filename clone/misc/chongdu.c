// chongdu.c

#include <ansi.h>
inherit COMBINED_ITEM;

void create()
{
        set_name(HIR "虫毒" NOR, ({ "chong du", "chong", "du", "chongdu" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIR "这是一粒由毒虫毒液精制而成的毒药，毒性相当猛烈。\n" NOR);
                set("base_unit", "粒");
                set("base_value", 100);
                set("base_weight", 10);
		set("poison_type", "poison");
                set("can_pour", 1);
                set("can_daub", 1);
                set("can_drug", 1);
                set("poison", ([
                        "level" : 180,
                        "id"    : "he tieshou",
                        "name"  : "虫毒",
                        "duration" : 12,
                ]));
                set("no_sell", 1);
		set("only_do_effect", 1);
        }
        setup();
        set_amount(1);
}

int do_effect(object me)
{
        message_vision("$N一仰脖，把毒药全部倒入了嘴中。\n", me);
        me->set_temp("die_reason", "吃了虫毒暴毙身亡了");
        me->die();

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}

