//beixin
#include <ansi.h>
#include <armor.h>

inherit ARMOR;

void create()
{
        set_name( "皮背心", ({ "pi beixin", "beixin" }) );
        set_weight(1000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "件");
        set("value" , 1000);
                set("material", "leather");
                set("armor_prop/armor", 6);
        }
        setup();
}
