#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(HIB "青天羽·七重天" NOR, ({ "qi chongtian", "qingtianyu", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("value", 2200000);
                set("material", "steel");
                set("long", HIW "\n青天羽·七重天乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" );
        }
        init_blade(150);
        setup();
}
