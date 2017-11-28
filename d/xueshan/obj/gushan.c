#include <weapon.h>
#include <ansi.h>

inherit DAGGER;

void create()
{
        set_name(NOR + CYN "铁骨扇" NOR, ({ "tiegu shan", "tigu", "shan" }));
        set_weight(6000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", NOR + CYN "这是一把铁骨扇，武林中人常常"
                            "用它作为打穴的兵器。\n" NOR);
                set("value", 3000);
                set("material", "steel");
                set("wield_msg", "$N从兜里掏出一把$n握在手中。\n");
                set("unwield_msg", "$N将手中的$n放回兜里。\n");
        }
        init_dagger(40, 0);
        setup();
}
