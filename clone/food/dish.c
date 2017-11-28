// dish.c ²ËëÈ

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("²ËëÈ", ({ "dish" }));
	set_weight(40);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "·İ");
		set("food_remaining", 4);
		set("food_supply", 15);
	}
}
