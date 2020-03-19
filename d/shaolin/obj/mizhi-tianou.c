// bocai-fentiao.c 蜜汁甜藕

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("密汁甜藕", ({"mizhi tianou", "tianou"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一盆香甜软糯，色泽粉红的蜜汁甜藕。\n");
		set("unit", "盆");
		set("value", 150);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
