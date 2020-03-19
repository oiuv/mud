// tieshou.c

#include <armor.h>

inherit HANDS;

void create()
{
	set_name( "铁手掌", ({ "iron hand", "hand" }) );
	set_weight(2000);
	if (clonep())
		set_default_object(__FILE__);
	else
        {
		set("material", "steel");
		set("unit", "块");
		set("value", 500);
		set("armor_prop/armor", 1 );
		set("armor_prop/hand", 5);
		set("armor_prop/strike", 5);
                set("armor_prop/unarmed_damage", 20);
		set("shaolin",1);
	}
        setup();
}
