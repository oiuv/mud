#include "herb.h"

void create()
{
        set_name(HIY "藤黄" NOR, ({ "teng huang", "teng", "huang", "herb_tenghuang" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "藤黄是常见的中药药材。\n" NOR);
                set("base_unit", "包");
                set("base_value", 5000);
                set("base_weight", 50);
        }
        setup();
}
