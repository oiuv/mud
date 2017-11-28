#include "herb.h"

void create()
{
        set_name(NOR + HIB "兰花" NOR, ({ "lan hua", "lan", "hua", "herb_lanhua" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + HIB "兰花是常见的中药药材。\n" NOR);
                set("base_unit", "朵");
                set("base_value", 500);
                set("base_weight", 20);
        }
        setup();
}
