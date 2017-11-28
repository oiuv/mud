#include "herb.h"

void create()
{
        set_name(HIY "牛黄" NOR, ({ "niu huang", "niu", "huang", "herb_niuhuang" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "牛黄是常见的中药药材。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 1000);
                set("base_weight", 60);
        }
        setup();
}
