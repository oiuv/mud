#include "herb.h"

void create()
{
        set_name(NOR + HIB "鲨胆" NOR, ({ "sha dan", "sha", "dan", "herb_shadan" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + HIB "海中鲨鱼的胆脏，是非常名贵的中药药材。\n" NOR);
                set("base_unit", "块");
                set("base_value", 10000);
                set("base_weight", 35);
        }
        setup();
}
