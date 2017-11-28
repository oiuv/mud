// tangbo.c 汤包

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("汤包", ({"tangbo"}));
	set_weight(80);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一个香喷喷的鲜肉汤包。\n");
		set("unit", "个");
		set("value", 50);
		set("food_remaining", 3);
		set("food_supply", 20);
	}
}
