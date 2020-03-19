#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + WHT "蝙蝠" NOR, ({ "bian fu", "bian", "fu" }));
	set("long", WHT "这是一只蝙蝠，正倒挂在洞顶。\n" NOR);
        set("no_auto_kill", 1);
        set("aves", 1);

	set("age", 1);
	set("str", 5);
	set("dex", 28);
	set("max_qi", 120);
	set("max_jing", 120);
	set("combat_exp", 1000);

        set("power", 3);

        set_temp("apply/dodge", 60);
        set_temp("apply/defense", 60);

	setup();
}
