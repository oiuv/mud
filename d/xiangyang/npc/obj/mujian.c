// mujian.c

#include <weapon.h>
inherit SWORD;

void create()
{
	set_name("木剑", ({ "mu jian", "sword", "jian" }));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一柄木匠做的木剑，手工相当精细。\n");
		set("value", 50);
		set("material", "steel");
		set("wield_msg", "$N从腰带里抽出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回腰带上。\n");
	}
	init_sword(3);
	setup();
}
