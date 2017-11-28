//zhanjia.c

#include <armor.h>

inherit CLOTH;

void create()
{
        set_name("战甲", ({"zhan armor","zhanjia","jia","armor"}));
      	set_weight(40000);
      	if (clonep())
      		set_default_object(__FILE__);
      	else 
	{
      		set("unit", "件");
      		set("long", "一件精钢造就的战甲。\n");
      		set("value", 3000);
      		set("material", "steel");
      		set("armor_prop/armor", 40);
      		set("armor_prop/dodge", -10);
	}

        setup();
}
