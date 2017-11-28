#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(HIW "九仪天尊剑" NOR, ({ "tianzun jian", "tianzun", "jian", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("value", 4500000);
                set("material", "steel");
                set("long", HIW "\n九仪天尊剑乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" );
        }
        init_sword(230);
        setup();
}
