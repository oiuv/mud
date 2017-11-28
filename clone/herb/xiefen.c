#include "herb.h"

void create()
{
        set_name(HIM "蝎粉" NOR, ({ "xie fen", "xie", "fen", "herb_xiefen" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIM "蝎粉是常见的中药药材。\n" NOR);
                set("base_unit", "包");
                set("base_value", 500);
                set("base_weight", 35);
        }
        setup();
}
