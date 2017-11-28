// rice.c 大米饭
// cck 17/6/97

inherit ITEM;

void init();
inherit F_FOOD;

void create()
{
	set_name("米饭",({"rice", "mi fan", "fan" }));
	set_weight(50);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "一碗刚从锅里盛出来的大米饭，还冒着热气～～～\n");
		set("unit", "碗");
		set("value", 120);
		  set("food_remaining", 5);
		  set("food_supply", 40);
	 }
}


