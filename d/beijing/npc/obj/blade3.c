#include <weapon.h>
#include <ansi.h>
inherit BLADE;
void create()
{
        set_name( "大刀",  ({ "da dao", "dao", "blade" }));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "一柄锋利的大刀。\n");
                set("value", 1000);
                set("material", "gold");
        }
        init_blade(10);
        setup();
}

