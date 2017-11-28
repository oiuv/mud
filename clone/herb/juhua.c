#include "herb.h"

void create()
{
        set_name(HIY "菊花" NOR, ({ "ju hua", "ju", "hua", "herb_juhua" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "菊花是常见的中药药材。\n" NOR);
                set("base_unit", "朵");
                set("base_value", 60);
                set("base_weight", 20);
        }
        setup();
}
