// zhizhu.c 蜘蛛

#include <ansi.h>

inherit POISON_INSECT;

void create()
{
	set_name("蜘蛛", ({ "zhi zhu" }) );
        set_weight(30);
	set("race", "野兽");
	set("age", 2);
	set("long", "一只黑黝黝的蜘蛛。\n");
	set("attitude", "peaceful");
	set("str", 20);
	set("con", 20);
        set("unit", "只");
	set("limbs", ({ "头部", "身体", "脚" }) );
	set("verbs", ({ "bite" }) );

        set("insect_poison", ([
                "level"  : 10,
                "maximum": 10,
        ]));

	set("combat_exp", 100);

	setup();
}
