// gudu.c

#include <ansi.h>
inherit COMBINED_ITEM;

void create()
{
        set_name(NOR + HIB "蛊毒" NOR, ({ "gu du", "gu", "du", "gudu" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIB "这是一粒集百毒之精华炼制而成的毒药，毒性猛烈之极。\n" NOR);
                set("base_unit", "粒");
                set("base_value", 100);
                set("base_weight", 10);
		set("poison_type", "poison");
                set("can_pour", 1);
                set("can_daub", 1);
                set("can_drug", 1);
                set("poison", ([
                        "level" : 220,
                        "id"    : "shi wanchen",
                        "name"  : "蛊毒",
                        "duration" : 18,
                ]));
                set("no_sell", 1);
		set("only_do_effect", 1);
        }
        setup();
        set_amount(1);
}

int do_effect(object me)
{
        message_vision("$N一仰脖，把蛊毒全部倒入了嘴中。\n", me);
        me->set_temp("die_reason", "吃了蛊毒暴毙身亡了");
        me->die();

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}

