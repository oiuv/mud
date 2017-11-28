//ring.c

#include <ansi.h>
#include <armor.h>

inherit HANDS;

void create()
{
        set_name(MAG"во╫П╫Дж╦"NOR, ({ "zijin jiezhi", "jiezhi", "ring" }));
        set("weight", 100);
        if (clonep())
        	set_default_object(__FILE__);
        else 
	{
        	set("unit", "╦Ж");
        	set("value", 1000);
        	set("material", "gold");
        	set("armor_prop/armor", 1);
	}

        setup();
}
