//shebian.c
#include <weapon.h>
inherit WHIP;

void create()
{
	set_name("蛇鞭", ({ "shebian", "bian" }));
	set_weight(700);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一柄蛇皮长鞭。\n");
		set("value", 300);
		set("material", "leather");
		set("wield_msg", "$N「唰」的一声抖出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n卷回腰间。\n");
	}
	init_whip(30);
	setup();
}
