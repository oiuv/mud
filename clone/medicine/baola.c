#include <ansi.h>
#include "medicine.h"

void create()
{
        set_name(HIY "三黄宝腊丹" NOR, ({"baola dan", "dan"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "武当派的疗伤圣药，具有极佳的解毒功效。\n" NOR);
                set("base_unit", "粒");
                set("base_value", 8000);
                set("base_weight", 55);
                set("only_do_effect", 1);
                set("mixture", ([
                        "herb" : ([ "tenghuang" : 2,
                                    "mahuang"   : 2,
                                    "xionghuang": 2,
                                    "duhuo"     : 1,
                                    "yanwo"     : 1,
                                    "xiongdan"  : 1,
                                    "lurong"    : 1,
                                    "shancha"   : 1,
                                    "renshen"   : 1,
                                    "xuelian"   : 1,
                                    "lingzhi"   : 1, ]),
                        "neili" : 400,
                        "jing"  : 60,
                        "time"  : 8,
                        "min_level" : 150,
                        "wudang-yaoli" : 220,
                ]));
        }
        setup();
}

int do_effect(object me)
{
        if (time() - me->query_temp("last_eat/jiedu") < 80)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        if (! me->query_skill_mapped("force"))
        {
                write("你没有激发任何内功，怎么发挥药力进行驱毒？\n");
                return 1;
        }

        me->set_temp("last_eat/jiedu", time());

        message_vision(HIY "$N" HIY "服下了一颗" + name() + HIY "，急忙"
                       "盘膝坐下，开始运功逼毒。\n" NOR, me);

        // 运功驱毒
        me->add_temp("apply/dispel_poison", 350);
        SKILL_D("force")->exert_function(me, "dispel");
        me->add_temp("apply/dispel_poison", -350);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

	return 1;
}
