#include "herb.h"

void create()
{
        set_name(NOR + YEL "鹿茸" NOR, ({ "lu rong", "lu", "rong", "herb_lurong" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + YEL "雄鹿的茸角，可以入药，非常的名贵。\n" NOR);
                set("base_unit", "根");
                set("base_value", 8000);
                set("base_weight", 150);
        }
        setup();
}
