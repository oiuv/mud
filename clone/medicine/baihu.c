#include <ansi.h>
#include "medicine.h"

void create()
{
        set_name(HIW "白虎夺命丹" NOR, ({"duoming dan", "dan"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "武当派的疗伤圣药，可治疗各种内伤，效果显著。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 8000);
                set("base_weight", 80);
                set("only_do_effect", 1);
                set("mixture", ([
                        "herb" : ([ "tianqi"   : 1,
                                    "juhua"    : 1,
                                    "zihua"    : 1,
                                    "lanhua"   : 1,
                                    "niuxi"   : 1,
                                    "xiefen"   : 1,
                                    "moyao"    : 1,
                                    "shengdi"  : 1,
                                    "yjhua"    : 1,
                                    "renshen"  : 1,
                                    "guiwei"   : 1,
                                    "chenpi"   : 1 ]),
                        "neili" : 300,
                        "jing"  : 50,
                        "time"  : 7,
                        "min_level" : 140,
                        "wudang-yaoli" : 180,
                ]));
        }
        setup();
}

int do_effect(object me)
{
        mapping my;

        if (time() - me->query_temp("last_eat/duoming") < 120)
        {
                write("你刚服用过药，需药性发挥完效用以后才能继续服用。\n");
                return 1;
        }

        me->set_temp("last_eat/duoming", time());

        message_vision(HIW "$N" HIW "服下一颗" + name() + HIW "，双目微闭，将丹药效力全数吸收。\n" NOR, me);
        tell_object(me, HIW "突然间你觉得血脉畅通，精神饱满之极。\n" NOR);

        log_file("static/using", sprintf("%s(%s) eat 白虎夺命丹 at %s.\n",
                 me->name(1), me->query("id"), ctime(time())));

        my = me->query_entire_dbase();
        my["eff_jing"] = my["max_jing"];
        my["jing"] = my["max_jing"];
        my["eff_qi"] = my["max_qi"];
        my["qi"] = my["max_qi"];

	me->start_busy(2);

        add_amount(-1);
        if (query_amount() < 1)
                destruct(this_object());

	return 1;
}
