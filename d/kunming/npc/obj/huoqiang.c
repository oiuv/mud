#include <ansi.h>
#include <weapon.h>

inherit HAMMER;

void create()
{
        set_name(HIY "金火枪" NOR, ({"jin huoqiang", "jin", "huoqiang"}));
        set_weight(5000);

        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "支");
                set("long", HIY "一支由黄金铸成，做工精细的火枪。\n" NOR);
                set("value", 25000);
                set("wield_msg", HIY "$N摸出一支金黄色的火枪握在手中。\n" NOR);
                set("unwield_msg", HIY "$N把手中的金火枪放入怀中。\n" NOR);
        }
        init_hammer(30);
        setup();
}
