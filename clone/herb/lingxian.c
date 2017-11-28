#include "herb.h"

void create()
{
        set_name(NOR + MAG "灵仙" NOR, ({ "ling xian", "ling", "xian", "herb_lingxian" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + MAG "灵仙是常见的中药药材。\n" NOR);
                set("base_unit", "块");
                set("base_value", 5000);
                set("base_weight", 40);
        }
        setup();
}
