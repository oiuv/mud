// piqiu.c
//

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("Æ¤ôÃ", ({ "piqiu" }) );
        set_weight(3000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("value", 5000);
                set("material", "cloth");
                set("armor_prop/armor", 10);
                set("armor_prop/warm", 35);
        }
        setup();
}

