inherit WORM;
#include <ansi.h>

void create()
{
        set_name(CYN "长螯蝎" NOR, ({ "changao xie", "changao", "xie" }));
        set("long", CYN "这是一只双螯巨大的毒蝎。\n" NOR);
        set("race", "野兽");        
        set("age", random(200)+100);
        set("attitude", "peaceful");

        set("max_qi", 200);
        set("max_jing", 100);

        set("str", 30);
        set("con", 30);
        set("limbs", ({ "头部", "身体", "尾巴" }));
        set("verbs", ({ "bite" }));

        set("worm_poison", ([
                "level"  : 30,
                "perhit" : 10,
                "remain" : 20,
                "maximum": 20,
                "supply" : 2,
        ]));

        set("combat_exp", 500 + random(500));

        set_temp("apply/attack", 15);
        set_temp("apply/damage", 15);
        set_temp("apply/armor", 15);
        set_temp("apply/defence", 20);
        setup();
}

void die()
{
        message_vision(HIR "\n$N" HIR "倒在地上，死了。\n\n" NOR, this_object());
        destruct(this_object());
}
