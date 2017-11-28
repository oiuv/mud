#include "herb.h"

void create()
{
        set_name(NOR + HIB "独活" NOR, ({ "du huo", "du", "huo", "herb_duhuo" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + HIB "独活是常见的中药药材。\n" NOR);
                set("base_unit", "根");
                set("base_value", 4000);
                set("base_weight", 50);
        }
        setup();
}
