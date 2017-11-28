// tiedi.c

#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
	set_name(HIB"铁笛"NOR, ({"tie di"}));
	set_weight(500);

	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "支");
		set("long", "一支黑铁做成的长笛，看上去坚忍异常。\n");
		set("value", 1000);
		set("material", "bamboo");
		set("wield_msg", "$N大袖一挥，手中已多了一支乌黑油光的铁笛。\n");
		set("unwield_msg", "$N手中铁笛一转，眨眼间铁笛已然不见影踪。\n");
	}
	init_sword(25);
	setup();
}
