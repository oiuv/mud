// youlong.c

#include <weapon.h>
#include <ansi.h>

inherit SWORD;

void create()
{
        set_name(CYN"龙泉剑"NOR, ({ "longquan sword", "longquan", "sword" }) );
        set_weight(4000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long",
"这是柄一看就知道是宝剑的利器。\n");
                set("value", 2400);
                set("material", "blacksteel");
                set("wield_msg", 
"只听见「飕」地一声，$N的手中已经多了一把寒光四射的宝剑——$n。\n");
                set("unequip_msg", "$N将手中的$n插入腰间的剑鞘。\n");
        }
        init_sword(60);
        setup();
}


