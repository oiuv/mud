//choupao.c

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("绸袍", ({"choupao", "cloth"}));
        set_weight(3000);
        if (clonep())
        	set_default_object(__FILE__);
        else 
	{
        	set("long","一件丝绸长袍，质的和裁剪都不错．\n");
        	set("material", "cloth");
        	set("unit", "件");
        	set("value", 600);
        	set("armor_prop/armor", 4);
		set("armor_prop/personality", 1);
	}

        setup();
}
