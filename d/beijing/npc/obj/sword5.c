#include <weapon.h>
#include <ansi.h>
inherit SWORD;
void create()
{
        set_name( "东厂铸剑",  ({ "dongchang jian", "dongchang", "jian" }));
        set_weight(10000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "一柄官府卫兵特用的长剑，剑脊上铸有“东厂”二字。\n");
                set("value", 2000);
                set("material", "gold");
        }
        init_sword(20);
        setup();
}

