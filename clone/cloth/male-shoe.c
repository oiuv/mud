// man-shoe.c
 
#include <armor.h>
 
inherit BOOTS;
 
void create()
{
	set_name("皮靴", ({ "pi xue", "xue" }) );
	set_weight(800);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("material", "leather");
		set("unit", "双");
		set("long", "这是一双用上好牛皮作的皮靴。\n");
		set("value", 0);
		set("armor_prop/dodge", 8);
	}
	setup();
}
