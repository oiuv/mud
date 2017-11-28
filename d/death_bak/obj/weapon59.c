#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(HIR "七狱地藏斩" NOR, ({ "dizang zhan", "dizang", "zhan", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("value", 4500000);
                set("material", "steel");
                set("long", HIW "\n七狱地藏斩乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" );
        }
        init_blade(230);
        setup();
}
