#include "herb.h"

void create()
{
        set_name(NOR + WHT "归尾" NOR, ({ "gui wei", "gui", "wei", "herb_guiwei" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + WHT "归尾是常见的中药药材。\n" NOR);
                set("base_unit", "块");
                set("base_value", 3000);
                set("base_weight", 50);
        }
        setup();
}
