// jpn-dao

#include <weapon.h>
inherit SWORD;

void create()
{
	set_name("西洋剑", ({ "sword", "jian" }));
	set_weight(4500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一柄细长的长剑，是西洋武士惯用的武器。\n");
		set("value", 4000);
		set("material", "steel");
		set("wield_msg", "$N「唰」的一声抽出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回刀鞘。\n");
	}
	init_sword(55);
	setup();
}
