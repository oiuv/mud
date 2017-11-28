#include <ansi.h>
#include "dan.h"
//inherit COMBINED_ITEM;

void create()
{
        set_name(HIY"轩辕"NOR+HIW"补心"NOR+YEL"丹"NOR, ({"xuanyuan dan", "dan"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("base_unit", "粒");
                set("base_value", 200);
                set("only_do_effect", 1);
        }
        setup();
        //set_amount(1);
}

int do_effect(object me)
{
        mapping my;

        if (time() - me->query_temp("last_eat/dan(full)") < 240)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        my = me->query_entire_dbase();

        me->set_temp("last_eat/dan(full)", time());

        message_vision(HIY "$N吃下一粒轩辕补心丹，再也感觉不到任何疲惫。\n" NOR, me);
        my["jingli"] = my["max_jingli"];
        my["neili"]  = my["max_neili"];
        my["jing"]   = my["max_jing"];
        my["qi"]     = my["max_qi"];
        my["eff_jing"] = my["max_jing"];
        my["eff_qi"]   = my["max_qi"];

        me->start_busy(6);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}

void owner_is_killed()
{
        destruct(this_object());
}