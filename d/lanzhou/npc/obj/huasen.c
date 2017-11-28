inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("油炸花生", ({"huasheng", "peanut"}));
	set_weight(60);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一碟香喷喷的花生米。\n");
		set("unit", "碟");
		set("value", 80);
		set("food_remaining", 2);
		set("food_supply", 40);
	}
}