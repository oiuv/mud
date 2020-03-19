#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + CYN "藏獒" NOR, ({ "zang ao", "zang", "ao" }));
	set("long", NOR + CYN "这是一只凶猛的藏獒，正警觉的来回踱步。\n" NOR);

	set("age", 1);
	set("str", 18);
	set("dex", 30);
	set("max_qi", 1000);
	set("max_jing", 1000);
	set("combat_exp", 20000);

        set("power", 22);
        set("item1", __DIR__"item/gourou");
        set("item2", __DIR__"item/goupi");

        set_temp("apply/parry", 120);
        set_temp("apply/dodge", 120);
        set_temp("apply/attack", 120);
        set_temp("apply/defense", 120);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 150);

	setup();
}
