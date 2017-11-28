// jiujiebian.c

#include <weapon.h>
inherit WHIP;

void create()
{
	set_name("九节鞭", ({ "jiujie bian", "bian" }));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一条九节鞭，由精钢铸就而成。\n");
		set("value", 100);
		set("material", "steal");
		set("wield_msg", "$N「唰」的一声抖出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n卷回腰间。\n");
	}
	init_whip(25);
	setup();
}
