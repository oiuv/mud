// wolfarrow.c
 
#include <weapon.h>
 
inherit THROWING;

int is_arrow() { return 1; }
 
void create()
{
	set_name("狼牙箭", ({ "wolf arrow", "arrow", "jian" }));
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "一根细长的箭，簇失略弯，如同狼牙一般阴森森的。\n");
		set("unit", "把");
		set("base_unit", "根");
		set("base_weight", 150);
		set("base_value", 500);
		set("wound_percent", 90);
	}

	set_amount(1);
	init_throwing(300);
	setup();

        set("no_wield", "这不是用来装备的。\n");
}
