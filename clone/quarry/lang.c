#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + WHT "野狼" NOR, ({ "ye lang", "ye", "lang" }));
	set("long", WHT "这是一只凶残饥饿的野狼。\n" NOR);

	set("age", 1);
	set("str", 35);
	set("dex", 40);
	set("max_qi", 1200);
	set("max_jing", 1200);
	set("combat_exp", 25000);

        set("power", 25);
        set("item1", __DIR__"item/langrou");
        set("item2", __DIR__"item/langpi");

        set_temp("apply/parry", 150);
        set_temp("apply/dodge", 150);
        set_temp("apply/attack", 120);
        set_temp("apply/defense", 120);
        set_temp("apply/unarmed_damage", 120);
        set_temp("apply/armor", 200);

	setup();
}
