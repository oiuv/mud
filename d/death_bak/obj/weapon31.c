#include <ansi.h>
#include <weapon.h>

inherit WHIP;

void create()
{
        set_name(HIW "玄冰索" NOR, ({ "xuanbing suo", "xuanbing", "suo", "whip" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("value", 1200000);
                set("material", "steel");
                set("long", HIW "\n玄冰索乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" );
        }
        init_whip(110);
        setup();
}
