// wucaizhu.c 五彩蛛

#include <ansi.h>

inherit POISON_INSECT;

void create()
{
	set_name(HIR "五" HIG "彩" HIW "蛛", ({ "wucai zhu" }) );
        set_weight(90);
	set("race", "野兽");
	set("age", 5);
	set("long", "一只巨大的，五颜六色的大蜘蛛。\n");
	set("attitude", "peaceful");
	set("str", 18);
	set("con", 25);
        set("unit", "只");
	set("limbs", ({ "头部", "身体", "脚" }) );
	set("verbs", ({ "bite" }) );

        set("insect_poison", ([
                "level"  : 90,
                "maximum": 45,
        ]));

	set("combat_exp", 7000);

	setup();
}
