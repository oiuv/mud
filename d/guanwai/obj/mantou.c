// mantou.c 馒头

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("白面馒头", ({ "mantou" }));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一个香喷喷的白面馒头。\n");
		set("unit", "个");
		set("value", 10);
		set("food_remaining", 4);
		set("food_supply", 30);
	}
}
