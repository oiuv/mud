#include "herb.h"

void create()
{
        set_name(NOR + WHT "生地" NOR, ({ "sheng di", "sheng", "di", "herb_shengdi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + WHT "生地是常见的中药药材。\n" NOR);
                set("base_unit", "块");
                set("base_value", 500);
                set("base_weight", 60);
        }
        setup();
}
