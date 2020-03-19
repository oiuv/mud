
#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name( "铁甲", ({"armor", "jia" }) );
        set_weight(28000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
                set("value", 4000);
                set("material", "leather");
                set("armor_prop/armor", 25);
        }
        setup();
}

