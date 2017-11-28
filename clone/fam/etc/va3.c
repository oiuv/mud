#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIG "玉石" NOR, ({ "yu shi", "yu", "shi" }));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIG "这是一块上等宝玉，相信可以"
                            "卖个好价钱。\n");
                set("value", 160000);
                set("unit", "块");

        }
}
