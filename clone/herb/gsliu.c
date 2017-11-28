#include "herb.h"

void create()
{
        set_name(NOR + CYN "干石榴" NOR, ({ "gan shiliu", "gan", "shiliu", "herb_gsliu" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + CYN "干石榴是常见的中药药材。\n" NOR);
                set("base_unit", "片");
                set("base_value", 200);
                set("base_weight", 75);
        }
        setup();
}
