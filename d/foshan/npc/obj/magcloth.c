// magcloth.c
//

#include <armor.h>

inherit CLOTH;
void create()
{
        set_name("紫袍", ({ "zi pao", "cloth" }) );
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("material", "cloth");
        set("value", 300);
                set("armor_prop/armor", 1);
        }
        setup();
}
