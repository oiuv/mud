#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + CYN "突鹰" NOR, ({ "tu ying", "tu", "ying" }));
	set("long", CYN "这是一只既丑陋，又威武的秃鹰。\n" NOR);
        set("aves", 1);

	set("age", 1);
	set("str", 35);
	set("dex", 50);
	set("max_qi", 1200);
	set("max_jing", 1200);
	set("combat_exp", 30000);

        set("power", 32);
        set("item1", __DIR__"item/yingrou");

        set_temp("apply/parry", 150);
        set_temp("apply/dodge", 150);
        set_temp("apply/attack", 120);
        set_temp("apply/defense", 120);
        set_temp("apply/unarmed_damage", 80);
        set_temp("apply/armor", 100);

	setup();
}
