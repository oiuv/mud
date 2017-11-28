#include <ansi.h>
#include <weapon.h>

inherit STAFF;

void create()
{
        set_name(RED "老君绝灭杖·三味火" NOR, ({ "sanwei huo", "laojunzhang", "zhang", "staff" }) );
        set_weight(22000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "根");
                set("value", 4000000);
                set("material", "steel");
                set("long", HIW "\n老君绝灭杖·三味火乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" NOR);
        }
        init_staff(220);
        setup();
}

