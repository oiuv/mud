//zuanjie.c

#include <armor.h>

inherit HANDS;

void create()
{
        set_name("×êÊ¯½äÖ¸", ({ "zuan jie", "zuanjie", "ring" }));
        set("weight", 400);
        if (clonep())
        	set_default_object(__FILE__);
        else
	{
        	set("unit", "¸ö");
        	set("value", 12000);
        	set("material", "diamond");
        	set("armor_prop/armor", 1);
        	set("armor_prop/personality", 1);
	}

        setup();
}       
