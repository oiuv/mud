#include "herb.h"

void create()
{
        set_name(NOR + YEL "洋金花" NOR, ({ "yang jinhua", "yang", "jinhua", "herb_yjhua" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + YEL "洋金花是常见的中药药材。\n" NOR);
                set("base_unit", "朵");
                set("base_value", 400);
                set("base_weight", 20);
        }
        setup();
}

