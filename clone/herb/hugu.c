#include "herb.h"

void create()
{
        set_name(HIW "虎骨" NOR, ({ "hu gu", "hu", "gu", "herb_hugu" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "成年虎的骨头，药性强烈，是非常名贵的中药药材。\n" NOR);
                set("base_unit", "根");
                set("base_value", 12000);
                set("base_weight", 100);
        }
        setup();
}
