#include <ansi.h>

#include <weapon.h>

inherit HAMMER;

void create()
{
        set_name(HIY"天罗锤"NOR, ({ "tianluo chui", "chui", "tianluo", "hammer" }) );
        set_weight(18000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("value", 250000);
                set("material", "steel");
        }
        init_hammer(50);
        setup();
}

