// gourou.c

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("¹·Èâ", ({"gou rou", "rou"}));
	set_weight(90);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "Ò»¿éÏãÅçÅçµÄ¹·Èâ¡£\n");
		set("unit", "¿é");
		set("value", 100);
		set("food_remaining", 5);
		set("food_supply", 40);
	}
}
