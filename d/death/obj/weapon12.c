#include <ansi.h>

#include <weapon.h>

inherit HAMMER;

void create()
{
        set_name(HIW"定妖神锤"NOR, ({ "dingyao chui", "chui", "dingyao", "hammer" }) );
        set_weight(18000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "把");
                set("value", 600000);
                set("material", "steel");
        }
        init_hammer(80);
        setup();
}

