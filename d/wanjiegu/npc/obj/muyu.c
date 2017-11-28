// muyu.c

#include <weapon.h>

inherit HAMMER;

void create()
{
        set_name("木鱼锤", ({ "muyu" }) );
        set_weight(8000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", "这是一把很沉的铁木鱼锤\n");
                set("value", 10000);
                set("material", "steel");
                set("wield_msg", "$N拿出一把$n，试了试重量，然後握在手中。\n");
                set("unwield_msg", "$N放下手中的$n。\n");
        }
        init_hammer(15);
        setup();
}

