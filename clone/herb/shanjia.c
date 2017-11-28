#include "herb.h"

void create()
{
        set_name(NOR + GRN "山甲" NOR, ({ "shan jia", "shan", "jia", "herb_shanjia" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + GRN "山甲是常见的中药药材。\n" NOR);
                set("base_unit", "片");
                set("base_value", 2000);
                set("base_weight", 60);
        }
        setup();
}
