#include <ansi.h>
#include <weapon.h>

inherit WHIP;

void create()
{
        set_name(HIR "神蛟丝·吞日" NOR, ({ "tun ri", "shenjiaosi", "suo", "whip" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("value", 3600000);
                set("material", "steel");
                set("long", HIW "\n神蛟丝·吞日乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" );
        }
        init_whip(200);
        setup();
}
