// suji.c 素鸡

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("素鸡", ({"suji", "ji"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一只做工考究素鸡。\n");
		set("unit", "只");
		set("value", 150);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
