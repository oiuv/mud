#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(HIW "白狐" NOR, ({ "bai hu", "bai", "hu" }));
	set("long", HIW "这是一只全身雪白的狐，双眼隐隐发光，透出灵气。\n" NOR);
        set("no_auto_kill", 1);

	set("age", 1);
	set("str", 35);
	set("dex", 35);
	set("max_qi", 1500);
	set("max_jing", 1500);
	set("combat_exp", 30000);

        set("power", 35);
        set("item1", __DIR__"item/lirou");
        set("item2", __DIR__"item/lipi2");

        set_temp("apply/parry", 150);
        set_temp("apply/dodge", 150);
        set_temp("apply/attack", 120);
        set_temp("apply/defense", 120);
        set_temp("apply/unarmed_damage", 120);
        set_temp("apply/armor", 200);

	setup();
}
