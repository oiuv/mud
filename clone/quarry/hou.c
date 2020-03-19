#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + YEL "猴子" NOR, ({ "hou zi", "hou", "zi" }));
	set("long", YEL "这是一只行动敏捷的大马猴。\n" NOR);
        set("no_auto_kill", 1);

	set("age", 1);
	set("str", 22);
	set("dex", 30);
	set("max_qi", 600);
	set("max_jing", 600);
	set("combat_exp", 8000);

        set("power", 15);

        set_temp("apply/parry", 80);
        set_temp("apply/dodge", 80);
        set_temp("apply/attack", 80);
        set_temp("apply/defense", 80);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 100);

	setup();
}
