// heiyi.c
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("ºÚÉ«³¤ÉÀ", ({ "chang shan", "cloth" }) );
        set_weight(2000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("material", "cloth");
                set("armor_prop/armor", 1);
        }
        setup();
}

