#include <ansi.h>

#include <weapon.h>

inherit HAMMER;

void create()
{
        set_name(HIW"¶¨ÑýÉñ´¸"NOR, ({ "dingyao chui", "chui", "dingyao", "hammer" }) );
        set_weight(18000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "°Ñ");
                set("value", 600000);
                set("material", "steel");
        }
        init_hammer(80);
        setup();
}

