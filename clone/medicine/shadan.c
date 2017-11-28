#include <ansi.h>
#include "medicine.h"

void create()
{
        set_name(HIW "田七鲨胆丸" NOR, ({"shadan wan", "wan"}));
        set_weight(50);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "集结数中名贵药材炼制而成的丹药，乃是桃花岛的独门奇药。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 5000);
                set("base_weight", 70);
                set("only_do_effect", 1);
                set("mixture", ([
                        "herb" : ([ "tianqi"   : 3,
                                    "shadan"   : 3,
                                    "lanhua"   : 1,
                                    "honghua"  : 1,
                                    "wulingzhi": 1,
                                    "lurong"   : 1,
                                    "zzfen"    : 1,
                                    "yjhua"    : 1,
                                    "xuejie"   : 1,
                                    "shengdi"  : 1 ]),
                        "neili" : 200,
                        "jing"  : 40,
                        "time"  : 6,
                        "min_level" : 160,
                        "taohua-yaoli" : 160,
                ]));
        }
        setup();
}

int do_effect(object me)
{
        mapping my;

        if (time() - me->query_temp("last_eat/wuchang") < 80)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        if (me->query("neili") >= me->query("max_neili"))
        {
                write("你现在内力饱满，无需服用田七鲨胆丸。\n");
                return 1;
        }

        me->set_temp("last_eat/wuchang", time());

        message_vision(HIW "$N" HIW "吞下田七鲨胆丸，长呼出一口气，脸色变得红润起来。\n" NOR, me);
        tell_object(me, HIC "你只觉得真气充沛，似乎有使不完的力气。\n" NOR);

        my = me->query_entire_dbase();
        my["neili"] = my["max_neili"];

	me->start_busy(3);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

	return 1;
}
