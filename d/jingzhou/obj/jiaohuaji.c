// jiaohuaji.c 叫化鸡

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("叫化鸡", ({"jiaohuaji", "ji", "chicken"}));
	set_weight(300);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一只烤得香喷喷的叫化鸡\n");
		set("unit", "只");
		set("value", 2000);
		set("food_remaining", 3);
		set("food_supply", 70);
	}
}

