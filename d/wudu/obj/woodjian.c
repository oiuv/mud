// musword.c 木剑

#include <weapon.h>
inherit SWORD;

void create()
{
        set_name("木剑", ({ "woodjian", "jian" }));
        set_weight(500);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "这是一柄练功用的木剑，剑头是平的。\n");
                set("value", 100);
                set("material", "wood");
                set("wield_msg", "$N「唰」的一声抽出一柄$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n插回剑鞘。\n");
        }
        init_sword(5);
        setup();
}
