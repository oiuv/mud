// zijinblade.c

#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
	set_name( MAG "紫金八卦刀" NOR , ({ "zijin bagua blade", "zijin blade", "bagua blade", "blade" }));
	set_weight(2000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "把");
		set("long", HIY "这是一把金光闪闪，威猛刚劲的宝刀，刀锋中隐隐带着紫光。\n" NOR );
		set("value", 2000);
		set("material", "steel");
		set("wield_msg", "$N「唰」的一声抽出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回刀鞘。\n");
	}
	init_blade(80,110);
	setup();
}