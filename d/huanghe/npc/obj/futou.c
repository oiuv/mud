// futou.c

#include <weapon.h>
inherit AXE;

void create()
{
	set_name("大斧头", ({ "futou", "da futou" }));
	set_weight(7000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一把砍柴的大斧头。\n");
		set("value", 1000);
		set("material", "steel");
		set("wield_msg", "$N「唰」的一声抽出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回后腰。\n");
	}
	init_axe(5);
	setup();
}

