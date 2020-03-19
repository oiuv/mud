#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + CYN "紫貂" NOR, ({ "zi diao", "zi", "diao" }));
	set("long", CYN "这是一只行动异常敏捷的紫貂。\n" NOR);
        set("no_auto_kill", 1);

	set("age", 1);
	set("str", 8);
	set("dex", 25);
	set("max_qi", 400);
	set("max_jing", 400);
	set("combat_exp", 3000);

        set("power", 7);
        set("item1", __DIR__"item/diaorou");
        set("item2", __DIR__"item/diaopi");

        set_temp("apply/parry", 60);
        set_temp("apply/dodge", 60);
        set_temp("apply/attack", 30);
        set_temp("apply/defense", 60);
        set_temp("apply/unarmed_damage", 30);
        set_temp("apply/armor", 30);

	setup();
}
