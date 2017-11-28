//shepi

#include <armor.h>

inherit CLOTH;

void create()
{
	set_name( "ÉßÆ¤", ({ "she pi", "pi" }) );
	set_weight(1000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "¼þ");
		set("value", 8000);
		set("material", "leather");
		set("armor_prop/armor", 10);
	}
	setup();
}
