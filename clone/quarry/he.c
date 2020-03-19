#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(HIR "丹顶鹤" NOR, ({ "danding he", "danding", "he" }));
	set("long", HIR "全身洁白的丹顶鹤，看来是修了翅膀，没法高飞了。\n" NOR);
        set("no_auto_kill", 1);
        set("aves", 1);

	set("age", 1);
	set("str", 5);
	set("dex", 28);
	set("max_qi", 150);
	set("max_jing", 150);
	set("combat_exp", 1000);

        set("power", 5);

        set_temp("apply/dodge", 60);
        set_temp("apply/defense", 60);

	setup();
}
