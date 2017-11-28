// xueli.c 大理雪梨

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("大理雪梨", ({"li", "xue li"}));
	set_weight(40);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一碟新鲜的大理雪梨。\n");
		set("unit", "碟");
		set("value", 80);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
