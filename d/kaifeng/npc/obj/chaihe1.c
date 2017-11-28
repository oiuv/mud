#include <weapon.h>
inherit STAFF;

void create()
{
	set_name("柴禾", ({ "chai he", "staff" }) );
	set_weight(2000);
        if (clonep())
        	set_default_object(__FILE__);
	else {
   	        set("unit", "根");
        	set("material", "wood");
       		set("long", "这是一根粗长的树枝。\n");
        }
        init_staff(5);
        setup();
}
