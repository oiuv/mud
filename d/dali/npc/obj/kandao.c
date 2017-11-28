// kandao.c

#include <weapon.h>
inherit BLADE;

void create()
{
	set_name("砍刀", ({ "kan dao", "dao", "blade" }));
	set_weight(7000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一柄很粗笨的砍刀，大概砍柴砍竹笋还凑合。\n");
		set("value", 10);
		set("material", "steel");
		set("wield_msg", "$N「唰」的一声抽出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回腰间。\n");
	}
	init_blade(5);
	setup();
}
