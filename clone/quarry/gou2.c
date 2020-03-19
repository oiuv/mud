#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + WHT "狼狗" NOR, ({ "lang gou", "lang", "gou" }));
	set("long", NOR + WHT "这是一只昂首挺胸，吐着长舌头的狼狗。\n" NOR);

	set("age", 1);
	set("str", 18);
	set("dex", 30);
	set("max_qi", 600);
	set("max_jing", 600);
	set("combat_exp", 8000);

        set("power", 13);
        set("item1", __DIR__"item/gourou");
        set("item2", __DIR__"item/goupi");

        set_temp("apply/parry", 80);
        set_temp("apply/dodge", 80);
        set_temp("apply/attack", 80);
        set_temp("apply/defense", 80);
        set_temp("apply/unarmed_damage", 80);
        set_temp("apply/armor", 100);

	setup();
}
