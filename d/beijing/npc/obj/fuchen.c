// fuchen.c 拂尘

#include <weapon.h>
inherit WHIP;

void create()
{
	set_name("拂尘", ({ "fu chen", "fu" ,"chen"}));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一柄普通的拂尘。\n");
		set("value", 100);
		set("wield_msg", "$N「唰」的一声抖出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n卷回腰间。\n");
	}
	init_whip(20);
	setup();
}
