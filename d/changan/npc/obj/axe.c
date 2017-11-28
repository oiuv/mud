//axe.c

#include <weapon.h>

inherit AXE;

void create()
{
	set_name("板斧", ({ "axe", "axe" }));
	set_weight(6000);
	if (clonep())
		set_default_object(__FILE__);
	else 
	{
		set("unit", "把");
		set("material", "steel");
		set("long", "这是一把沉重的大板斧，砍起东西来非常顺手。\n");
		set("value", 500);
		set("wield_msg", "$N拿出一把$n，握在手中当作武器。\n");
		set("unwield_msg", "$N放下手中的$n。\n");
	}
	init_axe(25, TWO_HANDED);

	setup();
}
