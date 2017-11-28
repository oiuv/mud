// shengsheng.c

#include <ansi.h>
#include "medicine.h"

void create()
{
        set_name(HIR "生生造化丹" NOR, ({"shengsheng dan", "dan"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一颗红色的药丸，具有神奇的疗效。\n");
                set("base_unit", "颗");
                set("base_value", 8000);
                set("base_weight", 80);
                set("only_do_effect", 1);
                set("mixture", ([
                        "herb" : ([ "tianqi"   : 1,
                                    "gsliu"    : 1,
                                    "duhuo"    : 1,
                                    "lurong"   : 1,
                                    "juhua"    : 1,
                                    "honghua"  : 1,
                                    "hafen"    : 1,
                                    "xiongdan" : 1,
                                    "heshouwu" : 1,
                                    "renshen"  : 1,
                                    "xuelian"  : 1,
                                    "dangui"   : 1,
                                    "chenpi"   : 1 ]),
                        "neili" : 300,
                        "jing"  : 50,
                        "time"  : 7,
                        "min_level" : 140,
                        "yaowang-miaoshu" : 220,
                ]));
        }
        setup();
}

int do_effect(object me)
{
        mapping my;

        if (time() - me->query_temp("last_eat/jiuhua") < 120)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        me->set_temp("last_eat/shengsheng", time());

        message_vision(HIG "$N" HIG "慢慢服下一颗" + name() +
                       HIG "，呼吸吐纳，将丹药效力全数吸收。\n" NOR, me);
        tell_object(me, HIG "不一会儿你只觉得精神饱满，神气完足，内力充沛之极。\n" NOR);

        log_file("static/using", sprintf("%s(%s) eat 生生造化丹 at %s.\n",
                 me->name(1), me->query("id"), ctime(time())));

        my = me->query_entire_dbase();
        my["eff_jing"] = my["max_jing"];
        my["jing"] = my["max_jing"];
        my["eff_qi"] = my["max_qi"];
        my["qi"] = my["max_qi"];
        if (my["jingli"] < my["max_jingli"])
                my["jingli"] = my["max_jingli"];
        if (my["neili"] < my["max_neili"])
                my["neili"] = my["max_neili"];

        me->start_busy(3);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

        return 1;
}

