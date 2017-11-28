#include <weapon.h>
#include <ansi.h>

inherit DAGGER;

void create()
{
        set_name(NOR + YEL "檀香扇" NOR, ({ "tanxiang shan", "tanxiang", "shan" }));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("long", NOR + YEL "这是一把由紫檀木刻制的"
                            "香木扇，芬芳馥郁。\n" NOR);
                set("value", 3000);
                set("material", "wood");
                set("wield_msg", "$N拿起一把$n握在手里。\n");
                set("unwield_msg", "$N合上$n，收回怀里。\n");
        }
        init_dagger(15);
        setup();
}

