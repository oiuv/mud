// huotui.c

inherit ITEM;
inherit F_FOOD;
#include <ansi.h>

void create()
{
	set_name(WHT"日本豆腐"NOR, ({ "riben doufu", "doufu" }) );
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "一碗嫩白油滑的日本豆腐。\n");
		set("unit", "碗");
		set("value", 100);
		set("food_remaining", 10);
		set("food_supply", 25);
		set("material", "meat");
	}
	setup();
}

