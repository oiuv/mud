// tie-gan.c : an example weapon

#include <weapon.h>

inherit SWORD;

void create()
{
        set_name("细铁杆", ({ "tie-gan" }) );
        set_weight(8000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("long", "这是一根又细又张的铁杆。\n");
                set("value", 10000);
                set("material", "steel");
                set("wield_msg", "$N拿出一根$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n放下。\n");
        }
        init_sword(10);
        setup();
}

