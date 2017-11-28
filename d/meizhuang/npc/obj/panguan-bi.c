// panguan-bi.c
#include <weapon.h>

inherit DAGGER;

void create()
{
        set_name("镔铁判官笔", ({ "panguan bi", "bi", "dagger" }));
        set_weight(12000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "对");
                set("long", "这是一对用镔铁打造的判官笔。\n");
                set("value", 2000);
                set("material", "steel");
                set("wield_msg", "$N「唰」的一声从怀中掏出一对$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n揣回怀里。\n");
        }
        init_dagger(25);
        setup();
}

