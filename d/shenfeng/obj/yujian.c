#include <ansi.h>
#include <weapon.h>

inherit SWORD;

void create()
{
    	set_name(HIW "玉剑" NOR, ({ "yu jian", "yu", "jian", "sword" }));
    	set_weight(500);
    	if (clonep())
        	set_default_object(__FILE__);
    	else {
        	set("unit", "柄");
        	set("long", HIW "一柄用白玉做成的长剑，相当的精美。\n" NOR);
        	set("value", 5000);
        	set("material", "jade");
      	}
    	init_sword(10);
    	setup();
}

