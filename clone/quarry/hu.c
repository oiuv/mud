#include <ansi.h>
inherit QUARRY;

void create()
{
	set_name(NOR + WHT "狐狸" NOR, ({ "hu li", "hu", "li" }));
	set("long", WHT "这是一只乖巧的狐，双眼隐隐发光，透出灵气。\n" NOR);
        set("no_auto_kill", 1);

	set("age", 1);
	set("str", 30);
	set("dex", 30);
	set("max_qi", 800);
	set("max_jing", 800);
	set("combat_exp", 10000);

        set("power", 20);
        set("item1", __DIR__"item/lirou");
        set("item2", __DIR__"item/lipi");

        set_temp("apply/parry", 120);
        set_temp("apply/dodge", 120);
        set_temp("apply/attack", 100);
        set_temp("apply/defense", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

	setup();
}
