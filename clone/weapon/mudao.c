// mudao.c

#include <weapon.h>

inherit BLADE;

void create()
{
	set_name("木刀", ({ "mu dao", "dao", "blade" }) );
	set_weight(2000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "把");
		set("value", 10);
		set("material", "wood");
		set("long", "这是一柄木制的短刀，胡家弟子用此刀练习刀法。\n");
		set("wield_msg", "$N抽出一把$n握在手中。\n");
		set("unequip_msg", "$N将手中的$n插回腰间。\n");
	}
	init_blade(3);
	setup();
}
