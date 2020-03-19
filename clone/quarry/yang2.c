#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + WHT "山羊" NOR, ({ "shan yang", "shan", "yang" }));
	set("long", WHT "这是一头短角山羊。\n" NOR);
        set("no_auto_kill", 1);

	set("age", 1);
	set("str", 8);
	set("dex", 25);
	set("max_qi", 400);
	set("max_jing", 400);
	set("combat_exp", 3000);

        set("power", 7);
        set("item1", __DIR__"item/yangrou");
        set("item2", __DIR__"item/yangpi");

        set_temp("apply/parry", 30);
        set_temp("apply/dodge", 30);
        set_temp("apply/attack", 30);
        set_temp("apply/defense", 50);
        set_temp("apply/unarmed_damage", 30);
        set_temp("apply/armor", 30);

	setup();
}
