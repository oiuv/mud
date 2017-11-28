#include "herb.h"

void create()
{
        set_name(NOR + WHT "山茶" NOR, ({ "shan cha", "chan", "cha", "herb_shancha" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + WHT "山茶是常见的中药药材。\n" NOR);
                set("base_unit", "朵");
                set("base_value", 200);
                set("base_weight", 20);
        }
        setup();
}
