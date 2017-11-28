#include <ansi.h>
#include <weapon.h>

inherit HAMMER;

void create()
{
    	set_name(HIW "玉斧" NOR, ({ "yu fu", "yu", "fu" }));
    	set_weight(500);
    	if (clonep())
        	set_default_object(__FILE__);
    	else {
        	set("unit", "柄");
        	set("long", HIW "一柄用白玉做成的斧头，相当的精美。\n" NOR);
        	set("value", 5000);
        	set("material", "jade");
      	}
    	init_hammer(10);
    	setup();
}

