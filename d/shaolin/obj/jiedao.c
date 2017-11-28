// jiedao.c

#include <weapon.h>

inherit BLADE;

void create()
{
	set_name("戒刀", ({ "jie dao", "dao", "blade" }) );
	set_weight(4000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "把");
		set("value", 200);
		set("material", "iron");
		set("long", "这是一柄尺半长的戒刀，刀光闪闪，入手沉重，似是精铁打成。\n");
		set("wield_msg", "$N抽出一把明晃晃的$n握在手中。\n");
		set("unequip_msg", "$N将手中的$n插入腰间的刀鞘。\n");
		set("shaolin", 1);
	}
	init_blade(25);
	setup();
}
