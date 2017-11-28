// jinwugong.c 金蜈蚣

#include <ansi.h>

inherit POISON_INSECT;

void create()
{
	set_name("金蜈蚣", ({ "jin wu gong" }) );
        set_weight(100);
	set("race", "野兽");
	set("age", 2);
	set("long", "一只金灿灿的蜈蚣，很是漂亮。\n");
	set("attitude", "peaceful");
	set("str", 20);
	set("con", 20);
        set("unit", "只");
	set("limbs", ({ "头部", "身体" }) );
	set("verbs", ({ "bite" }) );

        set("insect_poison", ([
                "level"  : 55,
                "maximum": 40,
        ]));

	set("combat_exp", 100);

	setup();
}
