#include <weapon.h>
#include <ansi.h>
inherit SWORD;
void create()
{
        set_name( CYN "镔铁长剑" NOR,  ({ "chang jian", "sword", "jian" }));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "一柄锋利的长剑。\n");
                set("value", 1200);
                set("material", "gold");
        }
        init_sword(15);
        setup();
}

