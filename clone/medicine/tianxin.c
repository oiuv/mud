// tianxin.c

#include <ansi.h>
#include "medicine.h"

void create()
{
        set_name(HIW "天心解毒丹" NOR, ({"tianxin dan", "dan"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一粒白色的药丸，具有相当好的解毒效果。\n");
                set("base_unit", "粒");
                set("base_value", 5000);
                set("base_weight", 50);
                set("only_do_effect", 1);
                set("mixture", ([
                        "herb" : ([ "yjhua"  : 1,
                                    "duhuo"  : 1,
                                    "chuanwu": 1,
                                    "chenpi" : 1,
                                    "fuzi"   : 1,
                                    "shengdi": 1,
                                    "moyao"  : 1,
                                    "xijiao" : 1,
                                    "lingzhi": 1,
                                    "gsliu"  : 1, ]),
                        "neili" : 100,
                        "jing"  : 35,
                        "time"  : 3,
                        "min_level" : 120,
                        "yaowang-miaoshu" : 120,
                ]));
        }
        setup();
}

int do_effect(object me)
{
        if (time() - me->query_temp("last_eat/tianxin") < 20)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        if (! me->query_skill_mapped("force"))
        {
                write("你没有激发任何内功，怎么发挥药力进行驱毒？\n");
                return 1;
        }

        me->set_temp("last_eat/tianxin", time());

        message_vision(HIY "$N" HIY "暗暗运了一口气，服下了" + name() +
                       HIY "，盘膝坐下，开始运功逼毒。\n" NOR, me);

        // 运功驱毒
        me->add_temp("apply/dispel_poison", 180);
        SKILL_D("force")->exert_function(me, "dispel");
        me->add_temp("apply/dispel_poison", -180);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}

