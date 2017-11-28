// longsword.c 长鞭

#include <weapon.h>
inherit WHIP;

void create()
{
	set_name("长鞭", ({ "changbian", "bian" }));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一柄普通的长鞭，由水牛精工编织而成。\n");
		set("value", 100);
		set("material", "leather");
		set("wield_msg", "$N「唰」的一声抖出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n卷回腰间。\n");
	}
	init_whip(20);
	setup();
}
