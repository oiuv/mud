// heiguafu.c 黑寡妇

#include <ansi.h>

inherit POISON_INSECT;

void create()
{
	set_name("黑寡妇", ({ "hei guafu" }) );
        set_weight(80);
	set("race", "野兽");
	set("age", 2);
	set("long", "一只长得巨大的丑陋无比的大蜘蛛。\n");
	set("attitude", "peaceful");
	set("str", 20);
	set("con", 20);
        set("unit", "只");
	set("limbs", ({ "头部", "身体", "脚" }) );
	set("verbs", ({ "bite" }) );

        set("insect_poison", ([
                "level"  : 80,
                "maximum": 30,
        ]));

	set("combat_exp", 100);

	setup();
}
