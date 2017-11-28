#include <weapon.h>
#include <ansi.h>

inherit DAGGER;

void create()
{
        set_name(WHT "毛笔" NOR, ({ "mao bi", "bi", "mao" }));
        set_weight(6000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "支");
                set("long", "一支普通的毛笔，武林中人常常用它作为打穴的兵器。\n");
                set("value", 200);
                set("material", "steel");
                set("wield_msg", "$N从兜里掏出一把$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n放回兜里。\n");
        }
        init_dagger(15, 0);
        setup();
}
