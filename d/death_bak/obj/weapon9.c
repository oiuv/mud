#include <ansi.h>
#include <weapon.h>

inherit HAMMER;

void create()
{
        set_name(CYN "冥王破狱锤" NOR, ({ "mingwang chui","mingwang","chui", "hammer" }));
        set_weight(28000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("value", 3800000);
                set("material", "steel");
                set("long", HIW "\n冥王破狱锤乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" NOR);
        }
        init_hammer(210);
        setup();
}


