// shanhu-baicai.c 珊瑚白菜

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("珊瑚白菜", ({"shanhu baicai", "baicai"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一盆红白相间，脆嫩爽口，清香诱人的珊瑚白菜。\n");
		set("unit", "盆");
		set("value", 150);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
