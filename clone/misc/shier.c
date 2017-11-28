// shier.c 食饵

#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name("食饵", ({ "shi er", "shi", "er" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是猎人常用的诱饵。\n");
                set("base_unit", "块");
                set("base_weight", 50);
                set("base_value", 10);
                set("no_sell", "干啥？我又不打猎，要这些捞子做甚？");
                set("unit", "些");
        }
        set_amount(1);
        setup();
}
