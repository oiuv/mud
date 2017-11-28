// shortblade.c

#include <weapon.h>

inherit THROWING;

void create()
{
	set_name("短刀", ({ "short blade", "dao" }));
	set_weight(7000);
	if (clonep())
		set_default_object(__FILE__);
	else
	{
                set("value", 0);
                set("base_unit", "柄");
                set("base_weight", 300);
                set("base_value", 0);
                set("material", "iron");
		set("unit", "把");
		set("long", "这是一捆飞刀。\n");
		set("value", 1000);
		set("material", "steel");
	}
	set_amount(18);
	init_throwing(25);
	setup();
}
