#include <ansi.h>
inherit ITEM;
inherit F_LIQUID;

void create()
{
	set_name(HIG "薄荷冰" NOR, ({"mint ice","mint","ice"}));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long",HIG "这是一杯特制的薄荷冰，看起来让人馋涎欲滴。\n" NOR);
		set("unit", "杯");
		set("value", 1000);
		set("max_liquid", 5);
	}

	set("liquid", ([
		"type": "water",
                 "name":HIG "薄荷冰" NOR,
		"remaining": 10,
		"supply": 20,
		"drunk_apply": 5,
	]));
}
