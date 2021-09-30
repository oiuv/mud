// maotan.c
//

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("毛毯", ({ "mao tan" }) );
        set_weight(20000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "张");
                set("material", "cloth");
        set("value", 2000);
                set("armor_prop/armor", 2);
        }
        setup();
}
