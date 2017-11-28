#include "herb.h"

void create()
{
        set_name(NOR + CYN "牛膝" NOR, ({ "niu xi", "niu", "xi", "herb_niuxi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + CYN "牛膝是常见的中药药材。\n" NOR);
                set("base_unit", "块");
                set("base_value", 2000);
                set("base_weight", 50);
        }
        setup();
}
