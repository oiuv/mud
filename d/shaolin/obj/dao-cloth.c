// dao-cloth.c
//

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("»Ò²¼Ïâ±ßôÂôÄ", ({ "jia sha", "cloth" }) );
        set_weight(5000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("material", "cloth");
                set("armor_prop/armor", 6);
        }
        setup();
}

