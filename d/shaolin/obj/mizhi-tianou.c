// bocai-fentiao.c ÃÛÖ­ÌğÅº

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("ÃÜÖ­ÌğÅº", ({"mizhi tianou", "tianou"}));
	set_weight(200);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "Ò»ÅèÏãÌğÈíÅ´£¬É«Ôó·ÛºìµÄÃÛÖ­ÌğÅº¡£\n");
		set("unit", "Åè");
		set("value", 150);
		set("food_remaining", 4);
		set("food_supply", 40);
	}
}
