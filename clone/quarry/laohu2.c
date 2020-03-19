#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + YEL "东北虎" NOR, ({ "dongbei hu", "dongbei", "hu" }));
	set("long", YEL "这是一只体型巨大的东北虎，威猛极了。\n" NOR);

	set("age", 3);
	set("str", 35);
	set("dex", 50);
	set("max_qi", 5000);
	set("max_jing", 5000);
        set("neili", 3200);
        set("max_neili", 3200);
	set("combat_exp", 350000);

        set("power", 50);
        set("item1", __DIR__"item/hurou");
        set("item2", __DIR__"item/hupi");

        set_temp("apply/parry", 200);
        set_temp("apply/dodge", 200);
        set_temp("apply/attack", 250);
        set_temp("apply/defense", 250);
        set_temp("apply/unarmed_damage", 280);
        set_temp("apply/armor", 280);

	setup();
}
