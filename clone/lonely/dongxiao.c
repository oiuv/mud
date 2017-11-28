#include <ansi.h>
#include <weapon.h>

inherit XSWORD;

void create()
{
        set_name(NOR + GRN "绿玉洞箫" NOR, ({"lvyu dongxiao", "lvyu", "dongxiao", "xiao"}));
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "支");
                set("long", GRN "一支绿玉做成的洞箫，看上去晶莹温润。武林"
                            "中人经常以萧代剑。\n" NOR);
                set("value", 800000);
                set("no_sell", 1);
                set("material", "stone");
                set("wield_msg", GRN "$N" GRN "大袖一挥，手中已多了一支晶莹温润的绿玉洞萧。\n" NOR);
                set("unwield_msg", GRN "$N" GRN "手中绿玉洞箫一转，眨眼间已然不见影踪。\n" NOR);
                set("stable", 100);
        }
        init_xsword(100);
        setup();
}
