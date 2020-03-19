#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
        set_name(HIW "白狐皮" NOR, ({ "baihu pi", "baihu", "pi" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "这是一张质地非常不错的狐狸皮，柔软光滑之极。\n" NOR);
                set("base_unit", "张");
                set("base_value", 10000);
                set("base_weight", 300);
        }
        setup();
        set_amount(1);
}
