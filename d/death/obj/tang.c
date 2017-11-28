#include <ansi.h>
inherit ITEM;

void setup()
{}

void init()
{
        add_action("do_eat", "drink");
}

void create()
{
        set_name(HIW "孟婆汤" NOR, ({"mengpo tang", "soup", "tang"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "一碗热气腾腾的孟婆汤，散发着浓烈的草药气味。\n");
                set("unit", "碗");
                set("only_do_effect", 1);
        }
        setup();
}

int do_eat(string arg)
{
        object ob;
        object me = this_player();
        int max;

        if( me->is_busy() )
                return notify_fail("急什么，小心别噎着了。\n");

        me->set_temp("last_eat/mengpo_tang", time());

        message_vision(HIW "$N" HIW "一仰头，将孟婆汤全部喝了下去，精神为之一振。\n" NOR, me);

        me->set("jingli",me->query("max_jingli"));
        me->set("neili",me->query("max_neili"));
        me->set("jing",me->query("max_jing"));
        me->set("qi",me->query("max_qi"));
        me->set("eff_jing",me->query("max_jing"));
        me->set("eff_qi",me->query("max_qi"));

        max = me->max_food_capacity();
        me->set("food", max);
        max = me->max_water_capacity();  
        me->set("water", max);
        me->clear_condition();

        me->start_busy(1);
        destruct(this_object());
        return 1;
}
