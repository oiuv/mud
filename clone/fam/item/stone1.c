#include <ansi.h>
#include "stone.h"

void create()
{
        set_name(HIR "炽石" NOR, ({ "chi shi", "chi", "shi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("base_unit", "颗");
                set("base_value", 30000);
                set("base_weight", 100);
        }
        setup();
}

