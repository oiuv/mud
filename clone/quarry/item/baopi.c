#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name(HIY "豹皮" NOR, ({ "bao pi", "bao", "pi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIY "成年雄豹的皮，革质坚韧，皮毛"
                            "柔软光滑之极。\n" NOR);
                set("base_unit", "张");
                set("base_value", 8000);
                set("base_weight", 450);
        }
        setup();
        set_amount(1);
}
