// nailao.c ÄÌÀÒ

inherit ITEM;
inherit F_FOOD;

void create()
{
	set_name("ÄÌÀÒ", ({ "nai lao", "nailao" }));
	set_weight(300);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("long", "Ò»¿éÈé»ÆÉ«µÄÄÌÀÒ¡£\n");
		set("unit", "¿é");
		set("value", 150);
		set("food_remaining", 5);
		set("food_supply", 60);
	}
}

