// axe.c

#include <weapon.h>

inherit AXE;

void create()
{
	set_name("斧头", ({ "axe", "fu tou" }));
	set_weight(10000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "把");
		set("long", "这是一把斧头，颇为沉重，是伐树的好工具。\n");
		set("value", 1000);
		set("material", "steel");
		set("wield_msg", "$N抓起一把斧头，握在手中。\n");
		set("unwield_msg", "$N将手中的斧头收了回来。\n");
	}
	init_axe(30, TWO_HANDED);
	setup();
}
