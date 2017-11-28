// tiebian.c 铁鞭

#include <weapon.h>
inherit WHIP;

void create()
{
	set_name("铁鞭", ({ "changbian", "bian" }));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一柄粗大的铁鞭，总有三十来斤重。\n");
		set("value", 100);
		set("material", "leather");
		set("wield_msg", "$N「唰」的一声抖出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n别回腰间。\n");
	}
	init_whip(40);
	setup();
}
