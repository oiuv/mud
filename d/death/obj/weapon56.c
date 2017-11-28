#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
        set_name(YEL "玄金斩·虚空" NOR, ({ "xu kong", "xuanjinzhan", "blade", "dao" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("value", 3300000);
                set("material", "steel");
                set("long", HIW "\n玄金斩·虚空乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" );
        }
        init_blade(195);
        setup();
}
