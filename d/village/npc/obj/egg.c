// egg.c 

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("五香茶叶蛋", ({"spicy egg", "egg"}));
	set_weight(60);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一颗用五种香料炮制出来的茶叶蛋。\n");
		set("unit", "颗");
		set("value", 50);
		set("food_remaining", 1);
		set("food_supply", 50);
	}
}
