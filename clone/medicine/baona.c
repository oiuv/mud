#include <ansi.h>
#include "medicine.h"

void create()
{
        set_name(HIY "三黄宝腊丹" NOR, ({"baola dan", "dan"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "这是一粒黄色的药丸，用牛黄辅以原料制成，具有不"
                            "错的解毒效果。\n" NOR);
                set("base_unit", "粒");
                set("base_value", 5000);
                set("base_weight", 55);
                set("only_do_effect", 1);
                set("mixture", ([
                        "herb" : ([ "yjhua"  : 1,
                                    "juhua"  : 1,
                                    "xuejie" : 1,
                                    "chenpi" : 1,
                                    "xiefen" : 1,
                                    "shengdi": 1,
                                    "lanhua" : 1,
                                    "gsliu"  : 1, ]),
                        "neili" : 80,
                        "jing"  : 30,
                        "time"  : 3,
                        "min_level" : 80,
                        "medical" : 100,
                ]));
        }
        setup();
}

int do_effect(object me)
{
        if (time() - me->query_temp("last_eat/jiedu") < 20)
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

        message_vision(HIY "$N" HIY "暗暗运了一口气，服下了" + name() +
                       HIY "，盘膝坐下，开始运功逼毒。\n" NOR, me);

        // 运功驱毒
        me->add_temp("apply/dispel_poison", 100);
        SKILL_D("force")->exert_function(me, "dispel");
        me->add_temp("apply/dispel_poison", -100);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

	return 1;
}
