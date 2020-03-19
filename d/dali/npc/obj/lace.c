// lace.c

#include <armor.h>

inherit NECK;

void create()
{
	set_name("贝壳项链", ({ "shell lace", "lace" }));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "串");
		set("value", 2500);
		set("armor_prop/armor", 5);
	}
	setup();
}	
