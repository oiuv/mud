#include <weapon.h>

inherit STAFF;

void create()
{
        set_name("禅杖", ({"staff", "zhang"}));
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", "这是一把禅杖，上面几个铁环叮当作响．\n");
                set("value", 500);
                set("material", "iron");
                set("wield_msg","$N拿出一把$n，握在手中。\n");
                set("unwield_msg", "$N放下手中的$n。\n");
        }

        init_staff(25);
        setup();
}

