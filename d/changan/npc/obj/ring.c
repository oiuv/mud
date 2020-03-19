//ring.c

#include <ansi.h>
#include <armor.h>

inherit HANDS;

void create()
{
        set_name(MAG"紫金戒指"NOR, ({ "zijin jiezhi", "jiezhi", "ring" }));
        set("weight", 100);
        if (clonep())
        	set_default_object(__FILE__);
        else 
	{
        	set("unit", "个");
        	set("value", 1000);
        	set("material", "gold");
        	set("armor_prop/armor", 1);
	}

        setup();
}
