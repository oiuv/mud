// Jay May 27, 96

#include <weapon.h>
inherit WHIP;

void create()
{
        set_name("拂尘", ({ "fuchen" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "这是一柄拂尘，做工精细，是很阴毒的兵器。\n");
                set("value", 30);
                set("material", "leather");
                set("wield_msg", "$N「唰」的一声从颈中抽出一柄$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n别回颈中。\n");
        }
        init_whip(50);
        setup();
}

