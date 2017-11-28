// toukui.c 头盔
 
#include <armor.h>
 
inherit HEAD;
 
void create()
{
	set_name("头盔", ({ "helmet", "toukui" }) );
	set_weight(2000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("material", "steel");
		set("unit", "顶");
		set("long", "这是一顶铁质的肚带，用以保护头部。\n");
		set("value", 1500);
		set("armor_prop/dodge", -5);
	}
	setup();
}