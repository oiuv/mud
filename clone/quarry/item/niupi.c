#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name(NOR + YEL "牛皮" NOR, ({ "niu pi", "niu", "pi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + YEL "牛的皮毛，革质坚韧，但却甚为粗糙。\n" NOR);
                set("base_unit", "张");
                set("base_value", 800);
                set("base_weight", 400);
        }
        setup();
        set_amount(1);
}
