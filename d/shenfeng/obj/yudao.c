#include <ansi.h>
#include <weapon.h>

inherit BLADE;

void create()
{
    	set_name(HIW "玉刀" NOR, ({ "yu dao", "yu", "dao", "blade" }));
    	set_weight(500);
    	if (clonep())
        	set_default_object(__FILE__);
    	else {
        	set("unit", "柄");
        	set("long", HIW "一柄用白玉做成的单刀，相当的精美。\n" NOR);
        	set("value", 5000);
        	set("material", "jade");
      	}
    	init_blade(10);
    	setup();
}

