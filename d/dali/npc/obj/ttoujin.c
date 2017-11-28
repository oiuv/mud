// ttoujin.c
 
#include <armor.h>
 
inherit HEAD;
 
void create()
{
	set_name("台夷头巾", ({ "tou jin" }) );
	set_weight(2000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("material", "steel");
		set("unit", "条");
		set("long", "这是一条台夷头巾，用以缠绕头部。\n");
		set("value", 1500);
		set("armor_prop/dodge", -5);
	}
	setup();
}
