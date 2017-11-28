#include <weapon.h>
#include <ansi.h>

inherit DAGGER;

void create()
{
        set_name(HIG "芭蕉扇" NOR, ({ "bajiao shan", "bajiao", "shan" }));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", HIG "芭蕉扇蒲扇，轻便风大，价格低廉。\n" NOR);
                set("value", 1000);
                set("material", "wood");
                set("wield_msg", "$N拿起一把$n握在手里。\n");
                set("unwield_msg", "$N合上$n，收回怀里。\n");
        }
        init_dagger(15);
        setup();
}

