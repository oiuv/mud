// baoming.c

#include <ansi.h>
#include "medicine.h"

void create()
{
        set_name(YEL "天王保命丹" NOR, ({"baoming dan", "dan"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", YEL "这是一颗淡黄的的药丸，是神龙岛的秘药，功效奇妙无比。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 8000);
                set("base_weight", 80);
                set("only_do_effect", 1);
                set("mixture", ([
                        "herb" : ([ "tianqi"   : 1,
                                    "xuejie"   : 1,
                                    "xuelian"  : 1,
                                    "lurong"   : 1,
                                    "xiefen"   : 1,
                                    "honghua"  : 1,
                                    "moyao"    : 1,
                                    "zzfen"    : 1,
                                    "heshouwu" : 1,
                                    "renshen"  : 1,
                                    "dangui"   : 1,
                                    "chenpi"   : 1 ]),
                        "neili" : 300,
                        "jing"  : 50,
                        "time"  : 5,
                        "min_level" : 140,
                        "shenlong-mixin" : 200,
                ]));
        }
        setup();
}

int do_effect(object me)
{
        mapping my;

        if (time() - me->query_temp("last_eat/baoming") < 120)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        me->set_temp("last_eat/baoming", time());

	message_vision(HIG "$N" HIG "吃下一粒" + name() +
                       HIG "，眼睛直冒绿光！\n", me);
        tell_object(me, HIG "不一会儿你只觉得精神饱满，神气完足，内力充沛之极。\n" NOR);

        log_file("static/using", sprintf("%s(%s) eat 天王保命丹 at %s.\n",
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
