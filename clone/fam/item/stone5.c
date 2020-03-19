#include <ansi.h>
#include "stone.h"

void create()
{
        set_name(HIG "辉月华石" NOR, ({ "hua shi", "hua", "shi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("base_unit", "颗");
                set("base_value", 500000);
                set("base_weight", 100);
        }
        setup();
}

