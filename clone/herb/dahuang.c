#include "herb.h"

void create()
{
        set_name(HIY "大黄" NOR, ({ "da huang", "da", "huang", "herb_dahuang" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "大黄是颇为名贵的中药药材。\n" NOR);
                set("base_unit", "块");
                set("base_value", 7000);
                set("base_weight", 100);
        }
        setup();
}
