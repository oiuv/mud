// ruanjian.c 软剑

#include <weapon.h>
inherit SWORD;

void create()
{
        set_name("软剑", ({ "ruanjian", "jian" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "这是一柄用特殊材料制成的钢剑。\n");
                set("value", 150);
                set("material", "steel");
                set("wield_msg", "$N「唰」的一声抽出一柄$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n插回剑鞘。\n");
        }
        init_sword(35);
        setup();
}

