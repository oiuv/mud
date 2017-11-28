// necklace.c 肚带
 
#include <armor.h>
 
inherit SURCOAT;
 
void create()
{
	set_name("肚带", ({ "surcoat", "du dai", "dai" }) );
	set_weight(500);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("material", "leather");
		set("unit", "条");
		set("long", "这是一件皮质的肚带，用以保护腹部。\n");
		set("value", 800);
		set("armor_prop/dodge", -3);
	}
	setup();
}