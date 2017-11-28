#include "herb.h"

void create()
{
        set_name(NOR + MAG "紫花" NOR, ({ "zi hua", "zi", "hua", "herb_zihua" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + MAG "紫花是常见的中药药材。\n" NOR);
                set("base_unit", "朵");
                set("base_value", 50);
                set("base_weight", 20);
        }
        setup();
}
