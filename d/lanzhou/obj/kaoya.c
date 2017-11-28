// kaoya.c 烤鸭

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("烤鸭", ({"kaoya", "ya"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一只肥得流油的北京烤鸭。\n");
		set("unit", "只");
		set("value", 150);
		set("food_remaining", 3);
		set("food_supply", 60);
	}
}
