// qiguoji.c

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("汽锅鸡", ({"qiguo ji", "chicken", "ji"}));
	set_weight(280);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "这是一锅热气腾腾的汽锅鸡。\n");
		set("unit", "锅");
		set("value", 200);
		set("food_remaining", 10);
		set("food_supply", 40);
	}
}
