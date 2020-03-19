#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name(NOR + CYN "鳄鱼皮" NOR, ({ "eyu pi", "eyu", "pi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + CYN "鳄鱼的皮革，非常的坚硬，相信"
                            "可以卖个好价钱，。\n" NOR);
                set("base_unit", "张");
                set("base_value", 10000);
                set("base_weight", 800);
        }
        setup();
        set_amount(1);
}
