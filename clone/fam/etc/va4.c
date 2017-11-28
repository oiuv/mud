#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIW "珍珠" NOR, ({ "zhen zhu", "zhen", "zhu" }));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "这是一颗浑圆的珍珠，相信可以"
                            "卖个好价钱。\n");
                set("value", 100000);
                set("unit", "颗");

        }
}
