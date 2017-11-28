#include "herb.h"

void create()
{
        set_name(HIM "麝香" NOR, ({ "she xiang", "she", "xiang", "herb_shexiang" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIM "散发着浓厚香味的麝香，可以入药。\n" NOR);
                set("base_unit", "块");
                set("base_value", 10000);
                set("base_weight", 50);
        }
        setup();
}
