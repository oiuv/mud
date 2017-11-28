#include <ansi.h>
#include "stone.h"

void create()
{
        set_name(HIW "ð©Ê¯" NOR, ({ "hao shi", "hao", "shi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("base_unit", "¿Å");
                set("base_value", 100000);
                set("base_weight", 100);
        }
        setup();
}

