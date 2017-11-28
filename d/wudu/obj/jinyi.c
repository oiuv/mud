#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("½õÒÂ", ({ "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("material", "cloth");
                set("armor_prop/armor", 50);
                set("value", 2000);
       }
        setup();
}

