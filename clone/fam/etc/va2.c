#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIC "翡翠" NOR, ({ "fei cui", "fei", "cui" }));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIC "这是一块上等翡翠，相信可以"
                            "卖个好价钱。\n");
                set("value", 180000);
                set("unit", "块");
        }
}
