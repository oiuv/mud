#include <weapon.h>
#include <ansi.h>

inherit DAGGER;

void create()
{
        set_name(HIC "团扇" NOR, ({ "tuan shan", "tuan", "shan" }));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", HIC "这是一把用上好绢丝制作的团"
                            "宫，绣着精细的花鸟。\n" NOR);
                set("value", 3000);
                set("material", "wood");
                set("wield_msg", "$N拿起一把$n握在手里。\n");
                set("unwield_msg", "$N合上$n，收回怀里。\n");
        }
        init_dagger(15);
        setup();
}

