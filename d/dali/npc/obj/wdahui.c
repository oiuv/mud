// wdahui.c

#include <armor.h>
inherit CLOTH;

void create()
{
	set_name("乌夷大麾", ({ "da hui" }));
	set("long", "这是一件乌夷大麾。\n");
	set_weight(2000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("material", "cloth");
		set("unit", "件");
		set("value", 200);
		set("armor_prop/armor", 3);
	}
	setup();
}
