#include <ansi.h>
#include "stone.h"

void create()
{
        set_name(HIY "á°Ê¯" NOR, ({ "lan shi", "lan", "shi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("base_unit", "¿Å");
                set("base_value", 50000);
                set("base_weight", 100);
        }
        setup();
}

