// huoxie.c 火蝎子

#include <ansi.h>

inherit POISON_INSECT;

void create()
{
	set_name("火蝎子", ({ "huo xie zi", "huo xie" }) );
        set_weight(220);
	set("race", "野兽");
	set("age", 2);
	set("long", "一只火红色的大蝎子。\n");
	set("attitude", "peaceful");
	set("str", 20);
	set("con", 20);
        set("unit", "只");
	set("limbs", ({ "头部", "身体", "脚", "尾巴" }) );
	set("verbs", ({ "bite" }) );

        set("insect_poison", ([
                "level"  : 60,
                "maximum": 25,
        ]));

	set("combat_exp", 100);

	setup();
}
