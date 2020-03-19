#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name(NOR + YEL "狗皮" NOR, ({ "gou pi", "gou", "pi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + YEL "狗的皮毛，毛杂不纯，革质颇为粗糙。\n" NOR);
                set("base_unit", "张");
                set("base_value", 500);
                set("base_weight", 300);
        }
        setup();
        set_amount(1);
}
