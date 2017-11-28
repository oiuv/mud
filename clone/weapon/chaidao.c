#include <weapon.h>
inherit BLADE;

void create()
{
        set_name("柴刀", ({ "chai dao", "chai", "blade", "dao" }));
        set_weight(5000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", "这是一柄普通的柴刀，不过上面已满是铁锈。\n");
                set("value", 80);
                set("material", "steel");
                set("wield_msg", "$N「唰」的一声抽出一柄$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n插回刀鞘。\n");
        }
        init_blade(15);
        setup();
}

