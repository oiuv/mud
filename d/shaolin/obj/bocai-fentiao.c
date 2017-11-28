// bocai-fentiao.c 菠菜粉条

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("菠菜粉条", ({"bocai fentiao", "fentiao"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一盆白绿相间，清香可口的菠菜粉条。\n");
		set("unit", "盆");
		set("value", 150);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
