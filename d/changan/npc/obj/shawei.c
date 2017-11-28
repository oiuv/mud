	//shawei.c

#include <weapon.h>

inherit STAFF;

void create()
{
        set_name("É±Íþ°ô", ({"shawei bang", "bang"}));
        set_weight(3000);
        if (clonep())
        	set_default_object(__FILE__);
        else 
	{
        	set("unit", "°Ñ");
        	set("value", 200);
        	set("material", "wood");
	}

        init_staff(20);
        setup();
}
