// liuli-qiezi.c 琉璃茄子

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("琉璃茄子", ({"liuli qiezi", "qiezi"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一盆青红相间，金黄透烂，清香四溢的琉璃茄子。\n");
		set("unit", "盆");
		set("value", 150);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
