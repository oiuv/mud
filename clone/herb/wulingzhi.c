#include "herb.h"

void create()
{
        set_name(NOR + MAG "五灵脂" NOR, ({ "wu lingzhi", "wu", "lingzhi", "herb_wulingzhi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + MAG "五灵脂是常见的中药药材。\n" NOR);
                set("base_unit", "块");
                set("base_value", 5000);
                set("base_weight", 100);
        }
        setup();
}
