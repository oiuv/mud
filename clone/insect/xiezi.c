// xiezi.c 蝎子

#include <ansi.h>

inherit POISON_INSECT;

void create()
{
	set_name("蝎子", ({ "xie zi" }) );
        set_weight(180);
	set("race", "野兽");
	set("age", 2);
	set("long", "一只张牙舞爪的蝎子。\n");
	set("attitude", "peaceful");
	set("str", 20);
	set("con", 20);
        set("unit", "只");
	set("limbs", ({ "头部", "身体", "脚", "尾巴" }) );
	set("verbs", ({ "bite" }) );

        set("insect_poison", ([
                "level"  : 30,
                "maximum": 25,
        ]));

	set("combat_exp", 100);

	setup();
}
