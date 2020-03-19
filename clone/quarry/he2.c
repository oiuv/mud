#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(HIW "雪鹤" NOR, ({ "xue he", "xue", "he" }));
	set("long", HIW "全身洁白的雪鹤，是大雪山的特产。\n" NOR);
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
