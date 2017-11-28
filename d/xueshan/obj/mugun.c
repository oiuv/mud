#include <weapon.h>
inherit STAFF;

void create()
{
        set_name("木棍", ({ "mu gun","gun"}));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("long", "这是一根木棍，举可齐眉，轻重合宜，可攻击大片敌人。\n");
                set("value", 50);
                set("material", "wood");
                set("wield_msg", "$N抽出一根$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n插回腰间。\n");
        }
        init_staff(5);
        setup();
}
