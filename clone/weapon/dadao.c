// dadao.c

#include <weapon.h>
inherit BLADE;

void create()
{
	set_name("大刀", ({ "dadao","blade" }));
	set_weight(7000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "柄");
		set("long", "这是一柄亮晃晃的大刀。\n");
		set("value", 200);
		set("material", "steel");
		set("wield_msg", "$N「唰」的一声从背后拨出一柄$n。\n");
		set("unwield_msg", "$N将手中的$n插回背后。\n");
	}
	init_blade(40);
	setup();
}
