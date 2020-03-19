// hupi.c


#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("虎皮", ({ "hu pi", "pi" }) );
        set_weight(2000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "块");
                set("material", "fur");
               	set("value", 2000);
                set("armor_prop/armor", 10);
        }
        setup();
}

