#include "herb.h"

void create()
{
        set_name(NOR + RED "蛤粉" NOR, ({ "ha fen", "ha", "fen", "herb_hafen" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + RED "蛤粉是常见的中药药材。\n" NOR);
                set("base_unit", "包");
                set("base_value", 5000);
                set("base_weight", 50);
        }
        setup();
}
