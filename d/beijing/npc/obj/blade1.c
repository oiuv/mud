#include <weapon.h>
#include <ansi.h>
inherit BLADE;
void create()
{
        set_name( HIW "钢刀" NOR,  ({ "gang dao", "dao", "blade" }));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "一柄钢铁打造的刀。\n");
                set("value", 2000);
                set("material", "gold");
        }
        init_blade(20);
        setup();
}

