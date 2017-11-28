// seng-xie.c

#include <ansi.h>
#include <armor.h>

inherit BOOTS;

void create()
{
	set_name( HIC "僧鞋" NOR, ({ "seng xie", "xie" }) );
	set_weight(1000);
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("unit", "双");
		set("long", "一双出家人用的青布僧鞋。\n");
		set("value", 0);
		set("material", "boots");
		set("armor_prop/dodge", 5);
	}
	setup();
}
