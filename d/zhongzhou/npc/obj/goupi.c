//beixin
#include <ansi.h>
#include <armor.h>

inherit CLOTH;

void create()
{
	set_name("นทฦค",({"gou pi","pi"}));
	set_weight(1200);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "ผþ");
		set("value",200);
                set("material", "leather");
		set("armor_prop/armor",5);
        }
        setup();
}

