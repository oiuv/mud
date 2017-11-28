// hsnr.c 红烧牛肉

inherit ITEM;
inherit F_FOOD;

void create()
{
    set_name("红烧牛肉", ({"hongshao niurou", "niurou"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
        set("long", "一盘炖得很烂很香的牛肉，看得你直流口水。\n");
        set("unit", "盘");
		set("value", 150);
		set("food_remaining", 3);
		set("food_supply", 60);
	}
}
