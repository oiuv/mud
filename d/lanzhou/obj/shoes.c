// gunny_shoes.c

#include <armor.h>

inherit BOOTS;

void create()
{
	set_name("麻鞋", ({ "gunny shoes", "shoes" }) );
	set_weight(500);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "双");
		set("long", 
"这是一双麻布鞋，不易大滑，供游人登山使用。\n");
		set("value", 150);
		set("material", "cloth");
                set("armor_type", "boots");
                set("armor_prop/armor", 1);
	}

}
