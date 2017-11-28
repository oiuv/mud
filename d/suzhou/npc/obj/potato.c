// potato.c

inherit ITEM;
inherit F_FOOD;
#include <ansi.h>

void create()
{
	set_name(HIY"土豆炖牛肉"NOR, ({ "potato" }));
	if( clonep() )
		set_default_object(__FILE__);
	else {
		set("long", "一碗热气腾腾的土豆炖牛肉，散发出诱人的香气。\n");
		set("unit", "碗");
		set("value", 100);
		set("food_remaining", 20);
		set("food_supply", 35);
		set("material", "meat");
	}
	setup();
}

