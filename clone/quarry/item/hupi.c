#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name(NOR + YEL "虎皮" NOR, ({ "hu pi", "hu", "pi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", NOR + YEL "成年猛虎的皮，革质坚韧，皮毛"
                            "柔软光滑之极。\n" NOR);
                set("base_unit", "张");
                set("base_value", 8000);
                set("base_weight", 500);
        }
        setup();
        set_amount(1);
}
