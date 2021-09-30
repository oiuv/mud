//sengyi.c

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("僧衣", ({"sengyi", "cloth"}));
        set_weight(1000);
        if (clonep())
            set_default_object(__FILE__);
        else
    {
            set("material", "cloth");
            set("unit", "件");
            set("armor_prop/armor", 2);
    }
        setup();
}
