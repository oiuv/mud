inherit WORM;
#include <ansi.h>

void create()
{
        set_name(HIB "黑寡妇" NOR, ({ "hei guafu", "hei", "guafu" }));
        set("long", HIB "这是一只全身充满了剧毒的黑寡妇。\n" NOR);
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
                "level"  : 80,
                "perhit" : 30,
                "remain" : 35,
                "maximum": 35,
                "supply" : 1,
        ]));

        set("combat_exp", 25000 + random(25000));

        set_temp("apply/attack", 50);
        set_temp("apply/damage", 50);
        set_temp("apply/armor", 100);
        set_temp("apply/defence", 100);
        setup();
}

void die()
{
        message_vision(HIR "\n$N" HIR "倒在地上，死了。\n\n" NOR, this_object());
        destruct(this_object());
}
