#include <ansi.h>
#include <weapon.h>

inherit CLUB;

void create()
{
        set_name(WHT "玄天棍·鬼虐" NOR, ({ "gui nue","club","gun", "xuantian gun" }));
        set_weight(20000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "杆");
                set("value", 3000000);
                set("material", "steel");
                set("long", HIW "\n玄天棍·鬼虐乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" NOR);
        }
        init_club(200);
        setup();
}


