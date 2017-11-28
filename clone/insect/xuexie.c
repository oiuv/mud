// xuexue.c 雪蝎子

#include <ansi.h>

inherit POISON_INSECT;

void create()
{
	set_name(WHT "雪蝎子" NOR, ({ "xue xie" }) );
        set_weight(180);
	set("race", "野兽");
	set("age", 2);
	set("long", "一只晶莹剔透的蝎子。\n");
	set("attitude", "peaceful");
	set("str", 25);
	set("con", 22);
        set("unit", "只");
	set("limbs", ({ "头部", "身体", "脚", "尾巴" }) );
	set("verbs", ({ "bite" }) );

        set("insect_poison", ([
                "level"  : 80,
                "maximum": 45,
        ]));

	set("combat_exp", 10000);

	setup();
}
