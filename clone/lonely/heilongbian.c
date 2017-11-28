#include <weapon.h>
#include <ansi.h>

inherit WHIP;

void create()
{
        set_name(NOR + WHT "黑龙鞭" NOR, ({ "heilong bian", "heilong", "bian", "whip" }) );
        set_weight(1000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", WHT "一支通体漆黑的长鞭，看上去倒是很坚韧。\n" NOR);
                set("unit", "根");
                set("value", 800000);
                set("no_sell", "这鞭…这不是史…大爷的东西吗？你…把他怎么了？");
                set("material", "steel");
                set("wield_msg", WHT "$N" WHT "从腰间取出一卷漆黑的长鞭，凌空挥舞个圈子。\n" NOR);
                set("unwield_msg", WHT "$N" WHT "一声轻哼，将手中黑龙鞭盘好，放回腰间。\n" NOR);
                set("stable", 100);
        }
        init_whip(80);
        setup();
}
