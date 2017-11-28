#include <weapon.h>
#include <ansi.h>

inherit DAGGER;

void create()
{
        set_name(HIW "羽毛扇" NOR, ({ "yumao shan", "yumao", "shan" }));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", HIW "这是一把用雪白色的鹤翅硬翎制"
                            "作的羽毛扇。\n" NOR);
                set("value", 1000);
                set("material", "wood");
                set("wield_msg", "$N拿起一把$n握在手里。\n");
                set("unwield_msg", "$N合上$n，收回怀里。\n");
        }
        init_dagger(15);
        setup();
}

