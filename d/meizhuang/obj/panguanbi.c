#include <weapon.h>
#include <ansi.h>

inherit DAGGER;

void create()
{
        set_name(NOR + CYN "判官笔" NOR, ({ "panguan bi", "bi", "panguan" }));
        set_weight(6000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "支");
                set("long", "一支镔铁所铸的判官笔，武林中人常常用它作为打穴的兵器。\n");
                set("value", 1000);
                set("material", "steel");
                set("wield_msg", "$N从兜里掏出一把$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n放回兜里。\n");
        }
        init_dagger(40, 0);
        setup();
}
