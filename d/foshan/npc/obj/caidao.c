// caidao.c

#include <weapon.h>
inherit BLADE;

void create()
{
	set_name("菜刀", ({ "cai dao", "blade" }));
	set_weight(7000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一柄亮晃晃的菜刀。\n");
		set("value", 1000);
		set("material", "steel");
		set("wield_msg", "$N「唰」的一声抽出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回裤腰。\n");
	}
	init_blade(5);
	setup();
}
