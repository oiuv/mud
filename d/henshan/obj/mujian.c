#include <weapon.h>
inherit SWORD;

void create()
{
	set_name("木剑", ({ "mu jian","jian" }));
	set_weight(800);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一柄用树枝削成的木剑。\n");
		set("value", 50);
		set("material", "wood");
		set("wield_msg", "$N抽出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回剑鞘。\n");
	}
	init_sword(1);
	setup();
}

