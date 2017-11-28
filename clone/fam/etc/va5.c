#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIM "玛瑙" NOR, ({ "ma nao", "ma", "nao" }));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIM "这是一块上等玛瑙，相信可以"
                            "卖个好价钱。\n");
                set("value", 120000);
                set("unit", "块");

        }
}
