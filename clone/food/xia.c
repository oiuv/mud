// xia.c 烤虾

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("烤虾", ({"kao xia", "xia"}));
	set_weight(100);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一只红通通，香喷喷的烤虾。\n");
		set("unit", "只");
		set("food_remaining", 4);
		set("food_supply", 10);
	}
}
