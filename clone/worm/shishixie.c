inherit WORM;
#include <ansi.h>

void create()
{
        set_name(HIR "食尸蝎" NOR, ({ "shishi xie", "shishi", "xie" }));
        set("long", HIR "这是一条三尺来长，全身铁甲的毒蝎子。\n" NOR);
        set("race", "野兽");
        set("age", random(200)+100);
        set("attitude", "peaceful");

        set("max_qi", 500);
        set("max_jing", 300);

        set("str", 40);
        set("con", 30);
        set("limbs", ({ "头部", "身体", "尾巴" }));
        set("verbs", ({ "bite" }));

        set("worm_poison", ([
                "level"  : 80,
                "perhit" : 30,
                "remain" : 35,
                "maximum": 35,
                "supply" : 2,
        ]));

        set("combat_exp", 25000 + random(25000));

        set_temp("apply/attack", 80);
        set_temp("apply/damage", 80);
        set_temp("apply/armor", 80);
        set_temp("apply/defence", 80);
        setup();
}

void die()
{
        message_vision(HIR "\n$N" HIR "倒在地上，死了。\n\n" NOR, this_object());
        destruct(this_object());
}
