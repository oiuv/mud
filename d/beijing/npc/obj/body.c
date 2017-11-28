#include <armor.h>

inherit ARMOR;

void create()
{
        set_name("Ìú¼×", ({"tie jia","tiejia","jia","armor","body",}));
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("long", "Ò»¼þ³ÁµéµéµÄÌú¼×¡£\n");
                set("value", 0);
                set("material", "steel");
                set("armor_prop/armor", 30);
                set("armor_prop/dodge", -10);
        }
        setup();
}
