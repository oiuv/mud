#include "herb.h"

void create()
{
        set_name(HIY "雄黄" NOR, ({ "xiong huang", "xiong", "huang", "herb_xionghuang" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "药性极强的中药药材，带在身上可以防止蛇虫及身。\n" NOR);
                set("base_unit", "块");
                set("base_value", 500);
                set("base_weight", 30);
        }
        setup();
}
