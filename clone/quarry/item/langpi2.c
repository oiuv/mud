#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name(HIW "银狼皮" NOR, ({ "yinlang pi", "yinlang", "pi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "银狼的皮毛，革毛具佳，颇为罕见，非常"
                            "之名贵。\n" NOR);
                set("base_unit", "张");
                set("base_value", 12000);
                set("base_weight", 300);
        }
        setup();
        set_amount(1);
}
