#include <ansi.h>
#include <weapon.h>

inherit WHIP;

void create()
{
        set_name(HIY "神蛟丝·噬月" NOR, ({ "shi yue", "shenjiaosi", "suo", "whip" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("value", 3200000);
                set("material", "steel");
                set("long", HIW "\n神蛟丝·噬月乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" );
        }
        init_whip(180);
        setup();
}
