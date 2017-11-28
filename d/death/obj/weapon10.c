#include <ansi.h>
#include <weapon.h>

inherit CLUB;

void create()
{
        set_name(HIC "定海神针·破九域" NOR, ({ "po jiuyu", "club", "gun", "shenzhen" }));
        set_weight(20000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "支");
                set("value", 3400000);
                set("material", "steel");
                set("long", HIW "\n定海神针·破九域乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" NOR);
        }
        init_club(220);
        setup();
}


