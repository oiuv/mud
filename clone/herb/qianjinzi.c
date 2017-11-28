#include "herb.h"

void create()
{
        set_name(HIY "千金子" NOR, ({ "qian jinzi", "qian", "jinzi", "herb_qianjinzi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "千金子是常见的中药药材。\n" NOR);
                set("base_unit", "颗");
                set("base_value", 3000);
                set("base_weight", 20);
        }
        setup();
}
