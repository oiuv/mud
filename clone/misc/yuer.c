// yuer.c 鱼饵

#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name("鱼饵", ({ "yu er", "er" }) );
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "这是钓鱼者常用的鱼食。\n");
                set("base_unit", "块");
                set("base_weight", 30);
                set("base_value", 7);
                set("no_sell", "这鱼吃的东西你也给我？");
                set("unit", "些");
        }

        set_amount(1);
        setup();
}
