#include "herb.h"

void create()
{
        set_name(HIG "当归" NOR, ({ "dang gui", "dang", "gui", "herb_dangui" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIG "当归是常见的中药药材。\n" NOR);
                set("base_unit", "块");
                set("base_value", 1000);
                set("base_weight", 70);
        }
        setup();
}
