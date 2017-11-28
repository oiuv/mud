#include <weapon.h>
#include <ansi.h>

inherit DAGGER;

void create()
{
        set_name(HIC "玉版扇" NOR, ({ "yuban shan", "yuban", "shan" }));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", HIC "这是一把由苍山巨竹雕琢为扇骨，色白"
                            "润如玉，因此叫做玉版扇。\n" NOR);
                set("value", 5000);
                set("material", "wood");
                set("wield_msg", "$N拿起一把$n握在手里。\n");
                set("unwield_msg", "$N合上$n，收回怀里。\n");
        }
        init_dagger(15);
        setup();
}

