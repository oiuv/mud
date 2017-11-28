#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(HIG "碧海残镢" NOR, ({ "bihai canjue", "bihai", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("value", 1700000);
                set("material", "steel");
                set("long", HIW "\n碧海残镢乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" );
        }
        init_blade(140);
        setup();
}
