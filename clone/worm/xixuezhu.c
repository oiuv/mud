inherit WORM;
#include <ansi.h>

void create()
{
        set_name(RED "吸血蛛" NOR, ({ "xixue zhu", "xixue", "zhu" }));
        set("long", RED "一只拳头大小，全身红毛的毒蜘蛛。\n" NOR);
        set("race", "野兽");
        set("age", random(200)+100);
        set("attitude", "peaceful");

        set("max_qi", 2000);
        set("max_jing", 1000);

        set("str", 30);
        set("con", 30);
        set("limbs", ({ "头部", "身体", "长腿" }));
        set("verbs", ({ "bite" }));

        set("worm_poison", ([
                "level"  : 180,
                "perhit" : 50,
                "remain" : 50,
                "maximum": 50,
                "supply" : 3,
        ]));

        set("combat_exp", 250000 + random(250000));

        set_temp("apply/attack", 100 + random(100));
        set_temp("apply/damage", 100 + random(100));
        set_temp("apply/armor", 200 + random(200));
        set_temp("apply/defence", 200 + random(200));
        setup();
}

void die()
{
        object ob;
        message_vision(HIR "\n$N" HIR "倒在地上，死了。\n\n" NOR, this_object());
        ob = new(__DIR__"obj/dunang");
        ob->move(environment(this_object()));
        destruct(this_object());
}
