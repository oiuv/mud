//laofang-key.c

#include <ansi.h>

inherit ITEM;

void create()
{
	set_name(HIC "牢房钥匙" NOR, ({"laofang key", "key"}));
	set_weight(100);
	if (clonep())
		set_default_object(__FILE__);
	else 
	{
		set("unit", "把");
		set("long", "一把牢房钥匙。\n");
	}
  
	set("is_monitored", 1);
	setup();
}


