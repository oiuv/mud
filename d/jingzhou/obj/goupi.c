// goupi.c
//
// This is the basic equip for players just login.

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("¹·Æ¤", ({ "gou pi", "pi" }) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¿é");
                set("material", "fur");
		set("value", 300);
                set("armor_prop/armor", 1);
        }
        setup();
}

