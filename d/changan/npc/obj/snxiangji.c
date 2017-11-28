//snxiangji.c

#include <ansi.h>

inherit ITEM;
inherit F_FOOD;

void create()
{
        string name =RED"Àÿ≈Øœ„º¶"NOR;
        set_name(name, ({"sunuan xiangji", "xiangji", "ji"}));
  	set_weight(300);
  	if (clonep())
	    	set_default_object(__FILE__);
  	else 
	{
		set("long", "“ª≈Ã¡Ó»À¥πœ—µƒ"+name+"°£\n");
    		set("unit", "≈Ã");
    		set("value", 1000);
    		set("food_remaining", 10);
    		set("food_supply", 30);
	}
}
