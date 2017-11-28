#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
        set_name(HIY "金刚剑·鬼龙" NOR, ({ "gui long", "jingangjian", "jian", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("value", 3700000);
                set("material", "steel");
                set("long", HIW "\n金刚剑·鬼龙乃九穹七狱神兵之一。\n" NOR);
                set("wield_msg", HIR "$N轻轻抖出$n" HIR "，刹时雷声轰鸣，一股杀气直聂九霄。\n" );
        }
        init_sword(200);
        setup();
}
