// huoba.c

#include <weapon.h>
 

inherit SWORD;

void create()
{
        set_name("火把",({ "huo ba" }) );
        set_weight(10000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "支");
                set("value", 10000);
                set("material", "wood");
                set("long", "这是支火把。\n");
                set("wield_msg", "$N拿出一根$n，握在手中。\n");
                set("unequip_msg", "$N放下手中的$n。\n");
        }
           init_sword(5);
        setup();
}

