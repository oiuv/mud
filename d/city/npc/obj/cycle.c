// necklace.c 武者项圈
 
#include <armor.h>
 
inherit NECK;
 
void create()
{
	set_name("武者项圈", ({ "neck-cycle", "xiang quan", "lian" }) );
	set_weight(1000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("material", "steel");
		set("unit", "串");
		set("long", "这是一串铁质的项链，用以保护颈部。\n");
		set("value", 1800);
		set("armor_prop/dodge", 5);
	}
	setup();
}
