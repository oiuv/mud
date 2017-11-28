#include "herb.h"

void create()
{
        set_name(NOR + HIB "东虫夏草" NOR, ({ "chong cao", "chong", "cao", "herb_chongcao" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + HIB "东为虫，夏为草。乃是极为名贵的中药药材。\n" NOR);
                set("base_unit", "根");
                set("base_value", 10000);
                set("base_weight", 85);
        }
        setup();
}
