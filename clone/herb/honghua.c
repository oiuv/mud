#include "herb.h"

void create()
{
        set_name(HIR "红花" NOR, ({ "hong hua", "hong", "hua", "herb_honghua" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIR "红花是常见的中药药材。\n" NOR);
                set("base_unit", "朵");
                set("base_value", 80);
                set("base_weight", 20);
        }
        setup();
}
