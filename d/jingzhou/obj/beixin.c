
#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
        set_name( "Æ¤±³ÐÄ", ({ "beixin", "pi beixin" }) );
        set_weight(1000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "¼þ");
                set("value", 2000);
                set("material", "leather");
                set("armor_prop/armor", 6);
        }
        setup();
}

