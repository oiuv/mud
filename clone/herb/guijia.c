#include "herb.h"

void create()
{
        set_name(NOR + CYN "龟甲" NOR, ({ "gui jia", "gui", "jia", "herb_guijia" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + CYN "乌龟的壳，上面有各种花纹，可以入药。\n" NOR);
                set("base_unit", "块");
                set("base_value", 5000);
                set("base_weight", 80);
        }
        setup();
}
