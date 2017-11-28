// whitecloth1.c
//
// This is the basic equip for players just login.

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("°×³ñÉÀ", ({ "white cloth", "cloth" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("material", "cloth");
                set("value", 300);
                set("armor_prop/armor", 3);
        }
        setup();
}

