#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + YEL "野猪" NOR, ({ "ye zhu", "ye", "zhu" }));
	set("long", YEL "这是一只凶猛异常的野猪。\n" NOR);

	set("age", 1);
	set("str", 35);
	set("dex", 40);
	set("max_qi", 1600);
	set("max_jing", 1600);
	set("combat_exp", 80000);

        set("power", 32);
        set("item1", __DIR__"item/zhurou");

        set_temp("apply/parry", 150);
        set_temp("apply/dodge", 150);
        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/unarmed_damage", 250);
        set_temp("apply/armor", 250);

	setup();
}
