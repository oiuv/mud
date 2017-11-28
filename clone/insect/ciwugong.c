// ciwugong.c 赤斑蜈蚣

#include <ansi.h>

inherit POISON_INSECT;

void create()
{
	set_name(RED "赤斑蜈蚣" NOR, ({ "chiban wu gong", "wugong" }) );
        set_weight(120);
	set("race", "野兽");
	set("age", 3);
	set("long", "一只长满了红色斑点的蜈蚣，很是怪异。\n");
	set("attitude", "peaceful");
	set("str", 22);
	set("con", 25);
        set("unit", "只");
	set("limbs", ({ "头部", "身体" }) );
	set("verbs", ({ "bite" }) );

        set("insect_poison", ([
                "level"  : 72,
                "maximum": 50,
        ]));

	set("combat_exp", 3000);

	setup();
}
