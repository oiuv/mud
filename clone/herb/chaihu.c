#include "herb.h"

void create()
{
        set_name(NOR + CYN "柴胡" NOR, ({ "chai hu", "chai", "hu", "herb_chaihu" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + CYN "柴胡是常见的中药药材。\n" NOR);
                set("base_unit", "块");
                set("base_value", 4000);
                set("base_weight", 60);
        }
        setup();
}
