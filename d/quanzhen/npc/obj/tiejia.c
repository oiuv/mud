// tiejia.c 铁甲
//

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("铁甲", ({ "armor" }) );
        set_weight(20000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("material", "steel");
                set("value", 2000);
                set("armor_prop/armor", 50);
        }
        setup();
}

