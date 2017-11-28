#include "herb.h"

void create()
{
        set_name(NOR + WHT "川乌" NOR, ({ "chuan wu", "chuan", "wu", "herb_chuanwu" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + WHT "川乌是常见的中药药材。\n" NOR);
                set("base_unit", "根");
                set("base_value", 200);
                set("base_weight", 50);
        }
        setup();
}
