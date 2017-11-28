#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(NOR + YEL "金块" NOR, ({ "jin kuai", "jin", "kuai" }));
        set_weight(2000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + YEL "这是一锭黄澄澄的金块，相信"
                            "可以卖个好价钱。\n");
                set("value", 150000);
                set("unit", "锭");
        }
}
