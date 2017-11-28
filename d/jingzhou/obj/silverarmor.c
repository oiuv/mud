
#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name( "ÁÁÒø¼×", ({"silverarmor","yinarmor", "yinjia" }) );
        set_weight(30000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("value", 10000);
                set("material", "leather");
                set("armor_prop/armor", 45);
        }
        setup();
}

