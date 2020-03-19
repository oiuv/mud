#include "herb.h"

void create()
{
        set_name(HIW "雪莲" NOR, ({ "xue lian", "xue", "lian", "herb_xuelian" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "雪莲是颇为名贵的中药药材。\n" NOR);
                set("base_unit", "朵");
                set("base_value", 30000);
                set("base_weight", 40);
        }
        setup();
}
