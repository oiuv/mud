#include "herb.h"

void create()
{
        set_name(NOR + WHT "田七" NOR, ({ "tian qi", "tian", "qi", "herb_tianqi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + WHT "田七是常见的中药药材。\n" NOR);
                set("base_unit", "根");
                set("base_value", 400);
                set("base_weight", 55);
        }
        setup();
}
