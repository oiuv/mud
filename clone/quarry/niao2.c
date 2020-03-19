#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + CYN "麻雀" NOR, ({ "ma que", "ma", "que" }));
	set("long", CYN "这是一只小麻雀，在田地间跳上跳下。\n" NOR);
        set("no_auto_kill", 1);
        set("aves", 1);

	set("age", 1);
	set("str", 5);
	set("dex", 28);
	set("max_qi", 80);
	set("max_jing", 80);
	set("combat_exp", 1000);

        set("power", 3);

        set_temp("apply/dodge", 60);
        set_temp("apply/defense", 60);

	setup();
}
