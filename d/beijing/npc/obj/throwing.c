#include <weapon.h>

inherit THROWING;

void create()
{
        set_name("飞璜石", ({"shi"}));
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long",    "飞璜石是一种十分常见的暗器。\n");
                set("unit", "些");
                set("base_unit", "块");
                set("base_weight", 50);
                set("value", 50);
        }
        set_amount(20);
        init_throwing(20,100010);
        setup();
}

