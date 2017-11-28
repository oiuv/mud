// bu-shoes.c example shoes

#include <ansi.h>

inherit EQUIP;

void create()
{
        set_name( GRN "布鞋" NOR, ({ "shoes" }) );
        set_weight(1000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "双");
                set("value", 50);
                set("material", "cloth");
                set("armor_type", "feet");
                set("armor_prop/armor", 2);
                set("armor_prop/dodge", 2);
                set("wear_msg","$N穿上一双$n。\n");
                set("remove_msg","$N将$n脱了下来。\n");
        }
}

