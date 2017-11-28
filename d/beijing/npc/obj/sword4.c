#include <weapon.h>
#include <ansi.h>
inherit SWORD;
void create()
{
        set_name( "官府用剑",  ({ "chang jian", "sword", "jian" }));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "一柄官府卫兵特用的长剑。\n");
                set("value", 2000);
                set("material", "gold");
        }
        init_sword(15);
        setup();
}

