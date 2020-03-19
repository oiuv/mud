// basi-shanyao.c 拔丝山药

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("拔丝山药", ({"basi shanyao", "shanyao"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一盆色若玫瑰，甜嫩香嫩的拔丝山药。\n");
		set("unit", "盆");
		set("value", 150);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
