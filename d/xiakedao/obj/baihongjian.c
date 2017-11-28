// baihongjian.c 白虹剑

#include <weapon.h>

inherit SWORD;

void create()
{
        set_name("白虹剑", ({ "baihongjian", "sword", "jian" }));
        set_weight(8000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "这是一口削铁如泥的宝剑。\n");
                set("value", 10000);
                set("material", "steel");
                set("weapon_prop/personality", 8);
                set("wield_msg", "$N「唰」的一声抽出一柄寒光闪闪的$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n插回剑鞘。\n");
        }
        init_sword(90);
        setup();
}
