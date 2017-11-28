// jiaxin-biji.c 夹心荸荠

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("夹心荸荠", ({"jiaxin biji", "biji"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一盆形态精巧别致，外脆里嫩，而又别有风味的夹心荸荠。\n");
		set("unit", "盆");
		set("value", 150);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
