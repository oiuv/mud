#include <ansi.h>
#include "dan.h"
//inherit COMBINED_ITEM;

void create()
{
        set_name(HIW"白虎"NOR+HIY"神农丹"NOR, ({"baihu dan", "dan"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("base_unit", "粒");
              //set("no_drop", "这样东西不能离开你。\n");
              //set("no_sell", "这样东西不能离开你。\n");
              //set("no_put", "这样东西不能放在那儿。\n");
              //set("no_get", "这样东西不能离开那儿。\n");
              //set("no_steal", "这样东西不能离开那儿。\n");
              //set("no_beg", "这样东西不能离开那儿。\n");
                set("base_value", 800);
                set("only_do_effect", 1);
        }
        setup();
        //set_amount(1);
}

int do_effect(object me)
{
        mapping my;

        if (time() - me->query_temp("last_eat/dan(S)") < 600)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        my = me->query_entire_dbase();

        me->set_temp("last_eat/dan(S)", time());

        message_sort(HIW "$N" HIW "吃下一颗$n" HIW "，只觉全身"
                     "筋脉逆流而上，内力源源不断的涌入丹田，说"
                     "不出的舒服受用。顿时感到灵台处如湖面一般"
                     "平静，以往所学的武学知识一一涌向心头，在"
                     "灵台处交融贯通。$N" HIW "感到的经验和潜能"
                     "有了一定的进展。\n" NOR, me, this_object());
        me->set("jingli", me->query("max_jingli"));
        me->set("neili", me->query("max_neili"));
        me->add("combat_exp", 800);
        me->add("potential", 800);

        me->start_busy(2);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}

void owner_is_killed()
{
        destruct(this_object());
}