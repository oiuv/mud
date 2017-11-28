#include "herb.h"

void create()
{
        set_name(HIG "灵芝" NOR, ({ "ling zhi", "ling", "zhi", "herb_lingzhi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIG "灵芝是颇为名贵的中药药材。\n" NOR);
                set("base_unit", "块");
                set("base_value", 20000);
                set("base_weight", 70);
        }
        setup();
}
