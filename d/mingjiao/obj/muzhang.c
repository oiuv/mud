
#include <weapon.h>
inherit STAFF;

void create()
{
        set_name("木杖", ({ "mu zhang" }));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("long", "这是一根龙头木杖。\n");
                set("value", 200);
                set("material", "wood");
                set("wield_msg", "$N抽出一根$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n矗立在地上。\n");
        }
        init_staff(60);
        setup();
}
