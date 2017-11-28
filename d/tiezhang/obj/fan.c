// fan.c 大米饭

#include <ansi.h>

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("大米饭", ({"mi fan", "fan"}));
	set_weight(500);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一碗香喷喷的大米饭。\n");
		set("unit", "碗");
		set("value", 30);
		set("food_remaining", 3);
		set("food_supply", 30);
	}
}