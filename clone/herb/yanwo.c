#include "herb.h"

void create()
{
        set_name(HIW "燕窝" NOR, ({ "yan wo", "yan", "wo", "herb_yanwo" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "雪燕在峭壁所制的窝巢，乃是极为名贵的中药药材。\n");
                set("base_unit", "块");
                set("base_value", 50000);
                set("base_weight", 35);
        }
        setup();
}
