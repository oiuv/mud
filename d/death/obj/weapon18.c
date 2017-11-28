#include <ansi.h>
#include <weapon.h>

inherit STAFF;

void create()
{
        set_name(MAG "七星杖·诛天" NOR, ({ "zhu tian", "qixingzhang", "zhang", "staff" }) );
        set_weight(18000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("value", 1800000);
                set("material", "steel");
                set("long", HIW "\n七星杖·诛天乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" NOR);
        }
        init_staff(150);
        setup();
}

