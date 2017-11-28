// biandan.c

#include <weapon.h>
inherit STAFF;

void create()
{
	set_name("熟铁扁担", ({ "bian dan" }));
	set_weight(50000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "根");
		set("long", "通身黑油油地，中间微弯，两头各有一个突起的鞘子。\n");
		set("value", 1500);
		set("rigidity",100);
		set("material", "steel");
		set("wield_msg", "$N抽出一根$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回腰间。\n");
	}
  	init_staff(15);
	setup();
}
