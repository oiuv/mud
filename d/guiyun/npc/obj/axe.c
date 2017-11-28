// axe.c

#include <weapon.h>
inherit AXE;

void create()
{
	set_name("砍柴斧", ({ "fu" }));
	set_weight(5000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "一柄砍柴用的短斧，斧刃上有几个缺口。\n");
		set("value", 1500);
		set("rigidity",100);
		set("material", "steel");
		set("wield_msg", "$N抽出一根$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回腰间。\n");
	}
  	init_axe(5);
	setup();
}
