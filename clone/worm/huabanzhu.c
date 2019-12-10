inherit WORM;
#include <ansi.h>

void create()
{
        set_name(HIR "花斑蛛" NOR, ({ "huaban zhu", "huaban", "zhu" }));
        set("long", HIR "这是一只全身五彩斑斓的毒蜘蛛。\n" NOR);
        set("race", "野兽");
        set("age", random(200)+100);
        set("attitude", "peaceful");

        set("max_qi", 300);
        set("max_jing", 150);

        set("str", 30);
        set("con", 30);
        set("limbs", ({ "头部", "身体", "长腿", "肚子" }));
        set("verbs", ({ "bite" }));

        set("worm_poison", ([
                "level"  : 40,
                "perhit" : 15,
                "remain" : 30,
                "maximum": 30,
                "supply" : 2,
        ]));

        set("combat_exp", 5000 + random(5000));

        set_temp("apply/attack", 15);
        set_temp("apply/damage", 15);
        set_temp("apply/armor", 30);
        set_temp("apply/defence", 30);
        setup();
}

void die()
{
        message_vision(HIR "\n$N" HIR "倒在地上，死了。\n\n" NOR, this_object());
        destruct(this_object());
}
