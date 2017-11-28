#include "herb.h"

void create()
{
        set_name(NOR + YEL "土狗" NOR, ({ "tu gou", "tu", "gou", "herb_tugou" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + YEL "土狗是常见的中药药材。\n" NOR);
                set("base_unit", "块");
                set("base_value", 8000);
                set("base_weight", 80);
        }
        setup();
}
