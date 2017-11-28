#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIW "钻石" NOR, ({ "zuan shi", "zuan", "shi" }));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "这是一颗上等钻石，相信可以"
                            "卖个好价钱。\n");
                set("value", 200000);
                set("unit", "颗");
        }
}
