#include <weapon.h>
#include <ansi.h>

inherit WHIP;

void create()
{
        set_name(HIW "银蛟鞭" NOR, ({ "yinjiao bian", "yinjiao", "bian", "whip" }) );
        set_weight(1000);
        if (clonep())
                destruct(this_object());
        else {
                set("long", HIW "一根纯银所铸的长鞭，鞭身生满了倒刺，很是坚韧。\n" NOR);
                set("unit", "根");
                set("value", 800000);
                set("no_sell", 1);
                set("material", "steel");
                set("wield_msg", HIW "$N" HIW "从腰间取出一卷银光闪闪的长鞭，凌空挥舞个圈子。\n" NOR);
                set("unwield_msg", HIW "$N" HIW "一声轻哼，将手中银蛟鞭盘好，放回腰间。\n" NOR);
                set("stable", 100);
        }
        init_whip(120);
        setup();
}
