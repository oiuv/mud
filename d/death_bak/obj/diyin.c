#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(RED "地阴血脉" NOR, ({ "diyin xuemai", "diyin", " xuemai"}));
        set_weight(700);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", RED "一块奇异的矿石,散发出隐隐血光。\n" NOR);
                set("unit", "块");
                set("value", 20000);
        }
}
