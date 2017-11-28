// jiuhua.c

#include <ansi.h>
#include "medicine.h"

void create()
{
        set_name(WHT "六合返精散" NOR, ({"liuhe san", "san"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", WHT "这是一小包白色的粉末，具有镇定养精的效果。\n" NOR);
                set("base_unit", "包");
                set("base_value", 2000);
                set("base_weight", 40);
                set("only_do_effect", 1);
                set("mixture", ([
                        "herb" : ([ "chuanwu"  : 1,
                                    "xuejie"   : 1,
                                    "yjhua"    : 1,
                                    "xiongdan" : 1,
                                    "shancha"  : 1,
                                    "gsliu"    : 1, ]),
                        "neili" : 80,
                        "jing"  : 35,
                        "time"  : 1,
                        "min_level" : 50,
                        "medical" : 80,
                ]));
        }
        setup();
}

int do_effect(object me)
{
        mapping my;

        if (time() - me->query_temp("last_eat/liuhe") < 10)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        my = me->query_entire_dbase();
        if (my["eff_jing"] == my["max_jing"])
        {
                write("你现在精神状态很好，无需服用" + name() + "。\n");
                return 1;
        }

        me->set_temp("last_eat/liuhe", time());

        message_vision(HIW "$N" HIW "一张嘴，吞下了" + name() +
                       HIW "，看上去精神好多了。\n" NOR, me);

        me->receive_curing("jing", 80);
        me->receive_heal("jing", 80);

	me->start_busy(1);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

	return 1;
}
