inherit WORM;
#include <ansi.h>

void create()
{
        set_name(HIY "金线蜈蚣" NOR, ({ "jinxian wugong", "jinxian", "wugong" }));
        set("long", HIY "这是一只金色的蜈蚣，背部有一条血线。\n" NOR);
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
                "level"  : 60,
                "perhit" : 20,
                "remain" : 40,
                "maximum": 40,
                "supply" : 3,
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
