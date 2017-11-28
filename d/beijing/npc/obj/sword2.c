#include <weapon.h>
#include <ansi.h>
inherit SWORD;
void create()
{
        set_name( HIW "钢剑" NOR,  ({ "gang jian", "sword", "jian" }));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "一柄锋利的长剑。\n");
                set("value", 3000);
                set("material", "gold");
        }
        init_sword(20);
        setup();
}

