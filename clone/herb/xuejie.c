#include "herb.h"

void create()
{
        set_name(NOR + RED "血竭" NOR, ({ "xue jie", "xue", "jie", "herb_xuejie" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + RED "血竭是常见的中药药材。\n" NOR);
                set("base_unit", "块");
                set("base_value", 200);
                set("base_weight", 40);
        }
        setup();
}
