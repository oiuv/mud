// cloth.c
//
// This is the basic equip for players just login.

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("°×ÒÂ", ({ "bai yi", "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("material", "cloth");
                set("value", 100);
                set("armor_prop/armor", 1);
        }
        setup();
}

