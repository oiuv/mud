#include <weapon.h>
inherit STAFF;

void create()
{
        set_name("铁灵牌", ({ "tie lingpai", "tie", "lingpai" }));
        set_weight(2000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "副");
                set("long", "这是一副精铁打铸的铁灵牌。\n");
                set("value", 800);
                set("rigidity", 100);
                set("material", "steel");
                set("wield_msg", "$N抽出一副$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n插回腰间。\n");
        }
        init_staff(35);
        setup();
}
