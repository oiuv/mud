// xiangliao.c 香料

#include <ansi.h>

inherit COMBINED_ITEM;

void create()
{
	set_name("特制香料", ({ "xiang liao", "xiangliao", "liao" }) );
	if( clonep() )
		set_default_object(__FILE__);
	else {
                set("long", "这是一块特制的香料，点燃后可以发出浓郁的香气。\n");
                set("base_unit", "块");
                set("base_weight", 5);
                set("base_value", 1);
		set("no_sell", 1);
        	set("unit", "些");
        }

        set_amount(1);
	setup();
}

