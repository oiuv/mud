// duzhu.c 毒蜘蛛

#include <ansi.h>

inherit POISON_INSECT;

void create()
{
	set_name("毒蜘蛛", ({ "du zhu" }) );
        set_weight(40);
	set("race", "野兽");
	set("age", 2);
	set("long", "一只背上有斑斑点点的的花蜘蛛，看来有剧毒。\n");
	set("attitude", "peaceful");
	set("str", 20);
	set("con", 20);
        set("unit", "只");
	set("limbs", ({ "头部", "身体", "脚" }) );
	set("verbs", ({ "bite" }) );

        set("insect_poison", ([
                "level"  : 40,
                "maximum": 20,
        ]));

	set("combat_exp", 100);

	setup();
}
